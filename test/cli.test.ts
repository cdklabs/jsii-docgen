import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

const cli = require.resolve('../lib/cli');

test('construct-library', () => {

  const libraryName = 'construct-library';
  const fixture = join(`${__dirname}/__fixtures__/libraries/${libraryName}`);

  // generate the documentation
  execSync(`${process.execPath} ${cli}`, { cwd: fixture });

  const md = readFileSync(join(fixture, 'API.md'), 'utf-8');
  expect(md).toMatchSnapshot();

});

test('specify language', () => {

  const libraryName = 'construct-library';
  const fixture = join(`${__dirname}/__fixtures__/libraries/${libraryName}`);

  // generate the documentation
  execSync(`${process.execPath} ${cli} --language python`, { cwd: fixture });

  const md = readFileSync(join(fixture, 'API.md'), 'utf-8');
  expect(md).toMatchSnapshot();

});

test('specify format', () => {

  const libraryName = 'construct-library';
  const fixture = join(`${__dirname}/__fixtures__/libraries/${libraryName}`);

  // generate the documentation
  execSync(`${process.execPath} ${cli} --format json`, { cwd: fixture });

  const json = readFileSync(join(fixture, 'API.json'), 'utf-8');
  expect(json).toMatchSnapshot();
});
