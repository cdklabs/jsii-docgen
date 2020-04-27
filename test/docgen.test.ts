import { renderFiles } from "../lib";
import * as glob from 'glob-promise';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs-extra';
import * as child_process from 'child_process';

/**
 * This test renders the docs for @aws-cdk/core at 1.33.1 and compares the
 * output to a checked in snapshot.
 */
test('snapshot test', async () => {
  const inputdir = fs.mkdtempSync(path.join(os.tmpdir(), 'docgen-input-'));
  const outdir = fs.mkdtempSync(path.join(os.tmpdir(), 'docgen-output-'));
  child_process.execSync(`npm install @aws-cdk/core@1.33.1`, { cwd: inputdir });

  const files = await glob(`${inputdir}/**/.jsii`);
  await renderFiles(files, outdir);
  await createDirectorySnapshot(outdir);

  expect(await createDirectorySnapshot(outdir)).toMatchSnapshot();
});

async function createDirectorySnapshot(dir: string) {
  const files = await glob(`**`, { cwd: dir });
  const output: { [filePath: string]: string } = {};

  for (const file of files) {
    output[file] = await fs.readFile(path.join(dir, file), 'utf-8');
  }

  return output;
}