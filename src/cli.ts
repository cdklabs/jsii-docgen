import * as fs from 'fs';
import * as yargs from 'yargs';
import { Language } from './docgen/transpile/transpile';
import { Documentation } from './index';

type GenerateOptions = {
  readme?: boolean;
  language: Language;
  submodule?: string;
  allSubmodules?: boolean;
}

async function generateForLanguage(docs: Documentation, format: 'md' | 'json', options: GenerateOptions, output = 'API') {
  const content = await (format === 'md' ? docs.toMarkdown(options) : docs.toJson(options));
  const fileSuffix = format === 'md' ? 'md' : 'json';

  fs.writeFileSync(`${output ?? 'API'}.${fileSuffix}`, content.render());
}


export async function main() {
  const args = yargs
    .usage('Usage: $0')
    .option('output', { alias: 'o', type: 'string', required: false, desc: 'Output filename, the file type is automatically added. (defaults to API.md if format is markdown, and API.json if format is JSON and one language is passed, API.language.md and API.language.json if multilpe are passed)' })
    .option('format', { alias: 'f', default: 'md', choices: ['md', 'json'], desc: 'Output format, markdown or json' })
    .option('language', { array: true, alias: 'l', default: ['typescript'], choices: Language.values().map(x => x.toString()), desc: 'Output language' })
    .option('package', { alias: 'p', type: 'string', required: false, desc: 'The name@version of an NPM package to document', defaultDescription: 'The package in the current directory' })
    .option('submodule', { alias: 's', type: 'string', required: false, desc: 'Generate docs for a specific submodule (or "root")' })
    .example('$0', 'Generate documentation for the current module as a single file (auto-resolves node depedencies)')
    .argv;


  const submodule = args.submodule === 'root' ? undefined : args.submodule;
  const allSubmodules = !args.submodule;
  const docs = await (args.package
    ? Documentation.forPackage(args.package)
    : Documentation.forProject(process.cwd()));
  const options = (lang: string) => ({ readme: false, language: Language.fromString(lang), submodule, allSubmodules });

  if (args.language.length <= 1) {
    await generateForLanguage(docs, args.format as 'md' | 'json', options(args.language[0]), args.output);
  } else {
    for (const lang of args.language) {
      const output = `${args.output ?? 'API'}.${lang}`;
      await generateForLanguage(docs, args.format as 'md' | 'json', options(lang), output);
    }
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
