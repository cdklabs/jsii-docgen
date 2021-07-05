import { Documentation } from '../../../src';

const ASSEMBLIES = `${__dirname}/../../__fixtures__/assemblies`;

jest.setTimeout(2 * 60 * 1000);

test('remote package', async () => {
  const docs = await Documentation.forRemotePackage('@aws-cdk/aws-ecr', '1.106.0');
  const markdown = docs.render();
  expect(markdown.render()).toMatchSnapshot();
});

describe('python', () => {
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
