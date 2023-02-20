import * as fs from 'fs/promises';
import * as yargs from 'yargs';
import { Language } from './docgen/transpile/transpile';
import { Documentation } from './index';

type GenerateOptions = {
  readme?: boolean;
  language: Language;
  submodule?: string;
  allSubmodules?: boolean;
  splitBySubmodules?: boolean;
  format?: 'md' | 'json';
  output?: string;
}

async function generateForLanguage(docs: Documentation, options: GenerateOptions) {
  const { format, output = 'API' } = options;
  const fileSuffix = format === 'md' ? 'md' : 'json';
  let submoduleSuffix = fileSuffix;

  const outputFileName = output.endsWith(`.${fileSuffix}`)
    ? output.slice(0, -(fileSuffix.length + 1))
    : output;
  // e.g. API.typescript as name
  if (outputFileName.includes('.')) {
    const languageSeperator = outputFileName.split('.')[1];
    submoduleSuffix = `${languageSeperator}.${fileSuffix}`;
  }

  if (options.splitBySubmodules) {
    if (format !== 'md') {
      throw new Error('split-by-submodule is only supported for markdown');
    }

    const submodules = await docs.listSubmodules();
    for (const submodule of submodules) {
      const content = await docs.toMarkdown({
        ...options,
        submodule: submodule.name,
        allSubmodules: false,
        header: { title: `\`${submodule.name}\` Submodule`, id: submodule.fqn },
      });

      await fs.writeFile(`${submodule.name}.${submoduleSuffix}`, content.render());
    }

    await fs.writeFile(`${outputFileName}.${fileSuffix}`, await (await docs.toIndexMarkdown(submoduleSuffix, options)).render());
  } else {
    const content = await (format === 'md' ? docs.toMarkdown(options) : docs.toJson(options));
    await fs.writeFile(`${outputFileName}.${fileSuffix}`, content.render());
  }
}


export async function main() {
  const args = yargs
    .usage('Usage: $0')
    .option('output', { alias: 'o', type: 'string', required: false, desc: 'Output filename, the file type is automatically added. Defaults to API.md if format is markdown (-f md) or API.json if format is JSON (-f json). If more than one language is passed, then the language will be included in the filename e.g. API.typescript.md' })
    .option('format', { alias: 'f', default: 'md', choices: ['md', 'json'], desc: 'Output format, markdown or json' })
    .option('language', { array: true, alias: 'l', default: ['typescript'], choices: Language.values().map(x => x.toString()), desc: 'Output language' })
    .option('package', { alias: 'p', type: 'string', required: false, desc: 'The name@version of an NPM package to document', defaultDescription: 'The package in the current directory' })
    .option('submodule', { alias: 's', type: 'string', required: false, desc: 'Generate docs for a specific submodule (or "root")' })
    .option('split-by-submodule', { type: 'boolean', required: false, desc: 'Generate a separate file for each submodule' })
    .example('$0', 'Generate documentation for the current module as a single file (auto-resolves node depedencies)')
    .argv;


  const submodule = args.submodule === 'root' ? undefined : args.submodule;
  const allSubmodules = !args.submodule;
  const splitBySubmodules = args['split-by-submodule'];
  const docs = await (args.package
    ? Documentation.forPackage(args.package)
    : Documentation.forProject(process.cwd()));

  const options = (lang: string, output?: string): GenerateOptions => ({
    readme: false,
    language: Language.fromString(lang),
    submodule,
    allSubmodules,
    splitBySubmodules,
    format: args.format as 'md' | 'json',
    output,
  });

  if (args.language.length <= 1) {
    await generateForLanguage(docs, options(args.language[0], args.output));
  } else {
    for (const lang of args.language) {
      const output = `${args.output ?? 'API'}.${lang}`;
      await generateForLanguage(docs, options(lang, output));
    }
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
