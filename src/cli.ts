import * as fs from 'fs/promises';
import * as path from 'node:path';
import * as yargs from 'yargs';
import { Language, submoduleRelName } from './docgen/transpile/transpile';
import { Documentation } from './index';

type GenerateOptions = {
  readme?: boolean;
  language: Language;
  submodule?: string;
  allSubmodules?: boolean;
  splitBySubmodules?: boolean;
  format: 'md' | 'json';
  output: string;
}

async function generateForLanguage(docs: Documentation, options: GenerateOptions) {
  const { format, output } = options;
  // e.g. API.typescript as name
  const splitByLanguage = output.endsWith(`.${options.language.name}`);
  const submoduleSuffix = splitByLanguage ? `${options.language.name}.${format}` : format;

  // Ensure the output path exists
  const outputPath = path.dirname(output);
  await fs.mkdir(outputPath, { recursive: true });

  if (options.splitBySubmodules) {
    if (format !== 'md') {
      throw new Error('split-by-submodule is only supported for markdown');
    }

    const submodules = await docs.listSubmodules();
    for (const submodule of submodules) {
      const content = await docs.toMarkdown({
        ...options,
        submodule: submodule.fqn,
        allSubmodules: false,
        header: { title: `\`${submoduleRelName(submodule)}\` Submodule`, id: submodule.fqn },
      });

      await fs.writeFile(path.join(outputPath, `${submoduleRelName(submodule)}.${submoduleSuffix}`), content.render());
    }

    await fs.writeFile(`${output}.${format}`, await (await docs.toIndexMarkdown(submoduleSuffix, options)).render());
  } else {
    const content = await (format === 'md' ? docs.toMarkdown(options) : docs.toJson(options));
    await fs.writeFile(`${output}.${format}`, content.render());
  }
}


export async function main() {
  const args = await yargs
    .usage('Usage: $0')
    .option('output', { alias: 'o', type: 'string', required: false, desc: 'Output filename, the file type is automatically added. Defaults to API.md if format is markdown (-f md) or API.json if format is JSON (-f json). If more than one language is passed, then the language will be included in the filename e.g. API.typescript.md' })
    .option('format', { alias: 'f', default: 'md', choices: ['md', 'json'], desc: 'Output format, markdown or json' })
    .option('language', { array: true, alias: 'l', default: ['typescript'], choices: Language.values().map(x => x.toString()), desc: 'Output language' })
    .option('package', { alias: 'p', type: 'string', required: false, desc: 'The name@version of an NPM package to document', defaultDescription: 'The package in the current directory' })
    .option('readme', { alias: 'r', type: 'boolean', required: false, desc: 'Include the user defined README.md in the documentation.' })
    .option('submodule', { alias: 's', type: 'string', required: false, desc: 'Generate docs for a specific submodule (or "root")' })
    .option('split-by-submodule', { type: 'boolean', required: false, desc: 'Generate a separate file for each submodule' })
    .example('$0', 'Generate documentation for the current module as a single file (auto-resolves node depedencies)')
    .argv;

  const submodule = args.submodule === 'root' ? undefined : args.submodule;
  const allSubmodules = !args.submodule;
  const readme = args.readme;
  const splitBySubmodules = args['split-by-submodule'];
  const docs = await (args.package
    ? Documentation.forPackage(args.package)
    : Documentation.forProject(process.cwd()));

  const options = (lang: string, output: string = 'API', includeLanguageInOutputName = false): GenerateOptions => {
    const format = args.format === 'md' ? 'md' : 'json';

    // Clean the user provided output of a possible file ending
    let outputFileName = output.endsWith(`.${format}`)
      ? output.slice(0, -(format.length + 1))
      : output;

    // for multi language docs, include the language in the filename
    if (includeLanguageInOutputName) {
      outputFileName = `${outputFileName}.${lang}`;
    }

    return ({
      readme,
      language: Language.fromString(lang),
      submodule,
      allSubmodules,
      splitBySubmodules,
      format,
      output: outputFileName,
    });
  };

  if (args.language.length <= 1) {
    await generateForLanguage(docs, options(args.language[0], args.output));
  } else {
    for (const lang of args.language) {
      await generateForLanguage(docs, options(lang, args.output, true));
    }
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});

