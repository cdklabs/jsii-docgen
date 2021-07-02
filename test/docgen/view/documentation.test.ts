import { Documentation } from '../../../src';

const ASSEMBLIES = `${__dirname}/../../__fixtures__/assemblies`;

jest.setTimeout(30 * 1000);

describe('python', () => {
  test('snapshot - root module', async () => {
    const docs = await Documentation.forAssembly(ASSEMBLIES, '@aws-cdk/aws-ecr', {
      language: 'python',
    });
    expect(docs.render().render()).toMatchSnapshot();
  });

  test('snapshot - submodules', async () => {
    const docs = await Documentation.forAssembly(ASSEMBLIES, 'aws-cdk-lib', {
      language: 'python',
      submodule: 'aws_eks',
    });
    expect(docs.render().render()).toMatchSnapshot();
  });
});

describe('typescript', () => {
  test('snapshot - single module', async () => {
    const docs = await Documentation.forAssembly(ASSEMBLIES, '@aws-cdk/aws-ecr');
    expect(docs.render().render()).toMatchSnapshot();
  });

  test('snapshot - submodules', async () => {
    const docs = await Documentation.forAssembly(ASSEMBLIES, 'aws-cdk-lib', {
      submodule: 'aws_eks',
    });
    expect(docs.render().render()).toMatchSnapshot();
  });
});
