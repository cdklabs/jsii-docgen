import { Documentation } from '../../../src';

const ASSEMBLIES = `${__dirname}/../../__fixtures__/assemblies`;
const LIBRARIES = `${__dirname}/../../__fixtures__/libraries`;

// this is a little concerning...we should be mindful
// if need to keep increasing this.
jest.setTimeout(2 * 60 * 1000);

test('lifecycle hooks are not invoked when installing packages', async () => {
  const docs = await Documentation.forRegistryPackage('@aws-cdk/aws-ecr', '1.106.0', {
    language: 'python',
  });
  const markdown = docs.render();
  expect(markdown.render()).toMatchSnapshot();

});

describe('python', () => {
  test('regsitry package', async () => {
    const docs = await Documentation.forRegistryPackage('@aws-cdk/aws-ecr', '1.106.0', {
      language: 'python',
    });
    const markdown = docs.render();
    expect(markdown.render()).toMatchSnapshot();
  });

  test('snapshot - root module', async () => {
    const docs = await Documentation.forAssembly('@aws-cdk/aws-ecr', ASSEMBLIES, {
      language: 'python',
    });
    const markdown = docs.render();
    expect(markdown.render()).toMatchSnapshot();
  });

  test('snapshot - submodules', async () => {
    const docs = await Documentation.forAssembly('aws-cdk-lib', ASSEMBLIES, {
      language: 'python',
    });
    const markdown = docs.render({ submodule: 'aws_eks' });
    expect(markdown.render()).toMatchSnapshot();
  });
});

describe('typescript', () => {

  test('regsitry package', async () => {
    const docs = await Documentation.forRegistryPackage('@aws-cdk/aws-ecr', '1.106.0');
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
