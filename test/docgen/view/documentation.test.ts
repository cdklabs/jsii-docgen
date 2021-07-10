import * as child from 'child_process';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs-extra';
import { Documentation } from '../../../src';
import { Language } from '../../../src/docgen/transpile/transpile';
import { extractPackageName } from '../../../src/docgen/view/documentation';

const ASSEMBLIES = `${__dirname}/../../__fixtures__/assemblies`;
const LIBRARIES = `${__dirname}/../../__fixtures__/libraries`;

// this is a little concerning...we should be mindful
// if need to keep increasing this.
jest.setTimeout(2 * 60 * 1000);


describe('extractPackageName', () => {

  test('scope only', () => {
    expect(extractPackageName('@aws-cdk/aws-ecr')).toEqual('@aws-cdk/aws-ecr');
  });

  test('scope and version', () => {
    expect(extractPackageName('@aws-cdk/aws-ecr@1.100.1')).toEqual('@aws-cdk/aws-ecr');
  });

  test('no scope no version', () => {
    expect(extractPackageName('aws-cdk-lib')).toEqual('aws-cdk-lib');
  });

  test('version only', () => {
    expect(extractPackageName('aws-cdk-lib@1.100.1')).toEqual('aws-cdk-lib');
  });

});

test('package installation does not run lifecycle hooks', async () => {

  const workdir = await fs.mkdtemp(path.join(os.tmpdir(), path.sep));
  const libraryName = 'construct-library';
  const libraryDir = path.join(LIBRARIES, libraryName);

  await fs.copy(libraryDir, workdir);

  const manifestPath = path.join(workdir, 'package.json');
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf-8'));

  // inject a postinstall hook
  manifest.scripts.postinstall = 'exit 1';
  await fs.writeFile(manifestPath, JSON.stringify(manifest));

  // create the package
  child.execSync('yarn package', { cwd: workdir });

  // this should succeed because the failure script should be ignored
  const docs = await Documentation.forPackage(path.join(workdir, 'dist', 'js', `${libraryName}@0.0.0.jsii.tgz`), { name: libraryName });
  const markdown = docs.render();
  expect(markdown.render()).toMatchSnapshot();
});

describe('python', () => {
  test('for package', async () => {
    const docs = await Documentation.forPackage('@aws-cdk/aws-ecr@1.106.0', {
      language: Language.PYTHON,
    });
    const markdown = docs.render();
    expect(markdown.render()).toMatchSnapshot();
  });

  test('snapshot - root module', async () => {
    const docs = await Documentation.forAssembly('@aws-cdk/aws-ecr', ASSEMBLIES, {
      language: Language.PYTHON,
    });
    const markdown = docs.render();
    expect(markdown.render()).toMatchSnapshot();
  });

  test('snapshot - submodules', async () => {
    const docs = await Documentation.forAssembly('aws-cdk-lib', ASSEMBLIES, {
      language: Language.PYTHON,
    });
    const markdown = docs.render({ submodule: 'aws_eks' });
    expect(markdown.render()).toMatchSnapshot();
  });
});

describe('typescript', () => {

  test('from package', async () => {
    const docs = await Documentation.forPackage('@aws-cdk/aws-ecr@1.106.0');
    const markdown = docs.render();
    expect(markdown.render()).toMatchSnapshot();
  });

  test('snapshot - single module', async () => {
    const docs = await Documentation.forAssembly('@aws-cdk/aws-ecr', ASSEMBLIES);
    const markdown = docs.render();
    expect(markdown.render()).toMatchSnapshot();
  });

  test('snapshot - submodules', async () => {
    const docs = await Documentation.forAssembly('aws-cdk-lib', ASSEMBLIES);
    const markdown = docs.render({ submodule: 'aws_eks' });
    expect(markdown.render()).toMatchSnapshot();
  });
});
