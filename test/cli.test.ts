import { execSync } from 'child_process';
import { mkdtempSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

test('construct-library', () => {

  const libraryName = 'construct-library';
  const fixture = join(`${__dirname}/__fixtures__/libraries/${libraryName}`);
  const tempdir = mkdtempSync(join(tmpdir(), 'jsii-docgen-test-'));
  const workdir = join(tempdir, libraryName);
  console.log(`Workdir: ${workdir}`);
  const tarball = `${__dirname}/../dist/js/jsii-docgen-v0.0.0.tgz`;
  const docgen = join(workdir, 'node_modules', '.bin', 'jsii-docgen');

  // create and compile the project
  execSync(`cp -r ${fixture} ${workdir}`);
  execSync('npm ci', { cwd: workdir });
  execSync('npm run compile', { cwd: workdir });

  // install current code of `jsii-docgen` onto it
  execSync(`npm install ${tarball}`, { cwd: workdir });

  // generate the documentation
  execSync(`${process.execPath} ${docgen}`, { cwd: workdir });

  const md = readFileSync(join(workdir, 'API.md'), 'utf-8');
  expect(md).toMatchSnapshot();

});