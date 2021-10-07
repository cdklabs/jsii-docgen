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

  test('throw error on unsupported language', () => {
    expect(() => Language.fromString('unsupported')).toThrowError(/Unsupported language: unsupported. Supported languages are/);
  });

  test('toString()', () => {
    expect(Language.PYTHON.toString()).toEqual('python');
  });

});

describe('submodules without an explicit name', () => {

  test('java', async () => {
    const docs = await Documentation.forAssembly('@aws-cdk/aws-cloudfront', Assemblies.AWSCDK_1_126_0, {
      language: Language.JAVA,
    });
    const markdown = docs.render({ submodule: 'experimental' });
    expect(markdown.render()).toMatchSnapshot();
  });

  test('python', async () => {
    const docs = await Documentation.forAssembly('@aws-cdk/aws-cloudfront', Assemblies.AWSCDK_1_126_0, {
      language: Language.PYTHON,
    });
    const markdown = docs.render({ submodule: 'experimental' });
    expect(markdown.render()).toMatchSnapshot();
  });

});