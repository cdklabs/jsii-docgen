import { renderDocs } from '../lib';
import yargs = require('yargs');

export async function main() {
  const args = yargs
    .usage('Usage: $0 JSII-FILE,...')
    .option('outdir', { type: 'string', alias: 'o', required: true, desc: 'Output directory', default: 'dist' })
    .option('links', { type: 'string', choices: [ 'markdown', 'hugo' ], default: 'markdown' })
    .example(`$0 node_modules/**/.jsii`, 'Generate documentation for all jsii modules in ')
    .argv;

  await renderDocs(args._, args.outdir);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
