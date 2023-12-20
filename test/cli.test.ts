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

test('specify submodule', () => {

  const libraryName = 'construct-library';
  const fixture = join(`${__dirname}/__fixtures__/libraries/${libraryName}`);

  // generate the documentation
  execSync(`${process.execPath} ${cli} --submodule submod1`, { cwd: fixture });

  const md = readFileSync(join(fixture, 'API.md'), 'utf-8');
  expect(md).toMatchSnapshot();

});

test('specify root submodule', () => {

  const libraryName = 'construct-library';
  const fixture = join(`${__dirname}/__fixtures__/libraries/${libraryName}`);

  // generate the documentation
  execSync(`${process.execPath} ${cli} --submodule root`, { cwd: fixture });

  const md = readFileSync(join(fixture, 'API.md'), 'utf-8');
  expect(md).toMatchSnapshot();

});


test('split-by-submodule creates submodule files next to output', () => {

  const libraryName = 'construct-library';
  const fixture = join(`${__dirname}/__fixtures__/libraries/${libraryName}`);

  // generate the documentation
  execSync(`${process.execPath} ${cli} --output=docs/API.md --split-by-submodule`, { cwd: fixture });

  const rootMd = readFileSync(join(fixture, 'docs/API.md'), 'utf-8');
  const submoduleMd = readFileSync(join(fixture, 'docs/submod1.md'), 'utf-8');
  expect(rootMd).toMatchSnapshot();
  expect(rootMd).toContain('# API Reference');
  expect(rootMd).toContain('## Submodules');
  expect(rootMd).toContain('- [submod1](./submod1.md)');
  expect(rootMd).toContain('## Constructs');
  expect(rootMd).toContain('GreeterBucket');
  expect(submoduleMd).toMatchSnapshot();

});

test('specify languages and split-by-submodule creates submodule files next to output', () => {

  const libraryName = 'construct-library';
  const fixture = join(`${__dirname}/__fixtures__/libraries/${libraryName}`);

  // generate the documentation
  execSync(`${process.execPath} ${cli} --output=docs/API.md --split-by-submodule -l typescript -l python`, { cwd: fixture });

  // TypeScript
  const rootTs = readFileSync(join(fixture, 'docs/API.typescript.md'), 'utf-8');
  const submoduleTs = readFileSync(join(fixture, 'docs/submod1.typescript.md'), 'utf-8');
  expect(rootTs).toMatchSnapshot('API.typescript.md');
  expect(rootTs).toContain('./submod1.typescript.md');
  expect(rootTs).toContain('greetWithSalutation');
  expect(submoduleTs).toMatchSnapshot('submod1.typescript.md');
  expect(submoduleTs).toContain('goodbyeWithPhrase');

  // Python
  const rootPy = readFileSync(join(fixture, 'docs/API.python.md'), 'utf-8');
  const submodulePy = readFileSync(join(fixture, 'docs/submod1.python.md'), 'utf-8');
  expect(rootPy).toMatchSnapshot('API.python.md');
  expect(rootPy).toContain('./submod1.python.md');
  expect(rootPy).toContain('greet_with_salutation');
  expect(submodulePy).toMatchSnapshot('submod1.python.md');
  expect(submodulePy).toContain('goodbye_with_phrase');

});