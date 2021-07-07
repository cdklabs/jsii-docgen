import * as child from 'child_process';
import * as path from 'path';
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
  const libraryDir = path.join(LIBRARIES, 'with-lifecycle-hook');
  child.execSync('yarn package', { cwd: libraryDir });
  const docs = await Documentation.fromPackage(path.join(libraryDir, 'dist', 'js', 'with-lifecycle-hook@0.0.0.jsii.tgz'), { name: 'with-lifecycle-hook' });
  const markdown = docs.render();
  expect(markdown.render()).toMatchSnapshot();
});

describe('python', () => {
  test('from package', async () => {
    const docs = await Documentation.fromPackage('@aws-cdk/aws-ecr@1.106.0', {
      language: Language.PYTHON,
    });
    const markdown = docs.render();
    expect(markdown.render()).toMatchSnapshot();
  });

  test('snapshot - root module', async () => {
    const docs = await Documentation.fromAssembly('@aws-cdk/aws-ecr', ASSEMBLIES, {
      language: Language.PYTHON,
    });
    const markdown = docs.render();
    expect(markdown.render()).toMatchSnapshot();
  });

  test('snapshot - submodules', async () => {
    const docs = await Documentation.fromAssembly('aws-cdk-lib', ASSEMBLIES, {
      language: Language.PYTHON,
    });
    const markdown = docs.render({ submodule: 'aws_eks' });
    expect(markdown.render()).toMatchSnapshot();
  });
});

describe('typescript', () => {

  test('from package', async () => {
    const docs = await Documentation.fromPackage('@aws-cdk/aws-ecr@1.106.0');
    const markdown = docs.render();
    expect(markdown.render()).toMatchSnapshot();
  });

  test('snapshot - single module', async () => {
    const docs = await Documentation.fromAssembly('@aws-cdk/aws-ecr', ASSEMBLIES);
    const markdown = docs.render();
    expect(markdown.render()).toMatchSnapshot();
  });

  test('snapshot - submodules', async () => {
    const docs = await Documentation.fromAssembly('aws-cdk-lib', ASSEMBLIES);
    const markdown = docs.render({ submodule: 'aws_eks' });
    expect(markdown.render()).toMatchSnapshot();
  });
});
