import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';
import * as reflect from 'jsii-reflect';
import * as yargs from 'yargs';
import { Documentation } from './index';

export async function main() {
  const args = yargs
    .usage('Usage: $0')
    .option('output', { type: 'string', alias: 'o', required: false, desc: 'Output filename (defaults to API.md)' })
    .example('$0', 'Generate documentation for the current module as a single file (auto-resolves node depedencies)')
    .argv;

  const assembly = await createAssembly();

  const docs = new Documentation({
    assembly,
    language: 'ts',
    readme: false,
  });

  const output = args.output ?? 'API.md';

  const markdown = docs.render().render();
  fs.writeFileSync(output, markdown);
}

async function createAssembly(): Promise<reflect.Assembly> {

  const ts = new reflect.TypeSystem();
  const root = path.join(process.cwd(), '.jsii');

  if (!fs.existsSync(root)) {
    throw new Error(`Unable to locate jsii assembly at: ${root}. Make sure to run this command `
      + 'from the root directory of your package after the jsii assembly has been created.');
  }

  await ts.loadFile('.jsii', { isRoot: true });

  // using 'glob' here is arguably a little wasteful, but better
  // then maintaining code trying to accurately deduce where each
  // required assembly is located.
  for (let dependency of glob.sync('./node_modules/**/.jsii')) {
    await ts.load(dependency);
  }

  return ts.roots[0];

}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
