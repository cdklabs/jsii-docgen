import { Documentation } from '../../../src';
import { Language } from '../../../src/docgen/transpile/transpile';
import { Assemblies } from '../assemblies';

jest.setTimeout(30000);

describe('language', () => {

  test('typescript is supported', () => {
    expect(Language.fromString('typescript')).toEqual(Language.TYPESCRIPT);
  });

  test('python is supported', () => {
    expect(Language.fromString('python')).toEqual(Language.PYTHON);
  });

  test('java is supported', () => {
    expect(Language.fromString('java')).toEqual(Language.JAVA);
  });

  test('csharp is supported', () => {
    expect(Language.fromString('csharp')).toEqual(Language.CSHARP);
  });

  test('throw error on unsupported language', () => {
    expect(() => Language.fromString('unsupported')).toThrowError(/Unsupported language: unsupported. Supported languages are/);
  });

  test('toString()', () => {
    expect(Language.PYTHON.toString()).toEqual('python');
  });

});

describe('submodules without an explicit name', () => {

  test('java', async () => {
    const docs = await Documentation.forAssembly('@aws-cdk/aws-cloudfront', Assemblies.AWSCDK_1_126_0);
    const markdown = await docs.render({ language: Language.JAVA, submodule: 'experimental' });
    expect(markdown.render()).toMatchSnapshot();
  });

  test('python', async () => {
    const docs = await Documentation.forAssembly('@aws-cdk/aws-cloudfront', Assemblies.AWSCDK_1_126_0);
    const markdown = await docs.render({ language: Language.PYTHON, submodule: 'experimental' });
    expect(markdown.render()).toMatchSnapshot();
  });

  test('csharp', async () => {
    const docs = await Documentation.forAssembly('@aws-cdk/aws-cloudfront', Assemblies.AWSCDK_1_126_0);
    const markdown = await docs.render({ language: Language.CSHARP, submodule: 'experimental' });
    expect(markdown.render()).toMatchSnapshot();
  });
});
