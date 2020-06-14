import { renderFiles, renderSinglePageModule } from '../lib';
import * as yargs from 'yargs';

export async function main() {
  const args = yargs
    .usage('Usage: $0 [JSII-FILE,...]')
    .option('output', { type: 'string', alias: 'o', required: false, desc: 'Output directory or file (default directory is "dist", default file is "APP.md")' })
    .example('$0', 'Generate documentation for the current module as a single file (auto-resolves node depedencies)')
    .example('$0 node_modules/**/.jsii', 'Generate documentation for all jsii modules in your project')
    .argv;


  if (args._.length === 0) {
    const output = args.output ?? 'API.md';
    await renderSinglePageModule(process.cwd(), output);
  } else {
    const output = args.output ?? 'dist';
    await renderFiles(args._, output);
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
