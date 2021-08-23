import * as fs from 'fs';
import * as yargs from 'yargs';
import { Language } from './docgen/transpile/transpile';
import { Documentation } from './index';

export async function main() {
  const args = yargs
    .usage('Usage: $0')
    .option('output', { type: 'string', alias: 'o', required: false, desc: 'Output filename (defaults to API.md)' })
    .option('language', { alias: 'l', default: 'typescript', choices: Language.values().map(x => x.toString()), desc: 'Output language' })
    .example('$0', 'Generate documentation for the current module as a single file (auto-resolves node depedencies)')
    .argv;

  const language = Language.fromString(args.language);
  const docs = await Documentation.forProject(process.cwd(), { language });
  const output = args.output ?? 'API.md';
  const markdown = docs.render({ readme: false });
  fs.writeFileSync(output, markdown.render());
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
