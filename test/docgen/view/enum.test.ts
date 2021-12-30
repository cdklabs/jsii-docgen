import * as reflect from 'jsii-reflect';
import { CSharpTranspile } from '../../../src/docgen/transpile/csharp';
import { JavaTranspile } from '../../../src/docgen/transpile/java';
import { PythonTranspile } from '../../../src/docgen/transpile/python';
import { Language } from '../../../src/docgen/transpile/transpile';
import { TypeScriptTranspile } from '../../../src/docgen/transpile/typescript';
import { Enum } from '../../../src/docgen/view/enum';
import { Assemblies } from '../assemblies';

const assembly: reflect.Assembly = Assemblies.instance.withoutSubmodules;

const metadata = {
  packageName: assembly.name,
  packageVersion: assembly.version,
};

const findEnum = (): reflect.EnumType => {
  if (assembly.enums[0]) {
    return assembly.enums[0];
  }
  throw new Error('Assembly does not contain an emum');
};

describe('python', () => {
  const transpile = new PythonTranspile();
  test('snapshot', () => {
    const enu = new Enum(transpile, findEnum()).toJson();
    const markdown = Enum.toMarkdown(enu, { language: Language.PYTHON, ...metadata });
    expect(enu).toMatchSnapshot();
    expect(markdown.render()).toMatchSnapshot();
  });
});

describe('typescript', () => {
  const transpile = new TypeScriptTranspile();
  test('snapshot', () => {
    const enu = new Enum(transpile, findEnum()).toJson();
    const markdown = Enum.toMarkdown(enu, { language: Language.TYPESCRIPT, ...metadata });
    expect(enu).toMatchSnapshot();
    expect(markdown.render()).toMatchSnapshot();
  });
});

describe('java', () => {
  const transpile = new JavaTranspile();
  test('snapshot', () => {
    const enu = new Enum(transpile, findEnum()).toJson();
    const markdown = Enum.toMarkdown(enu, { language: Language.JAVA, ...metadata });
    expect(enu).toMatchSnapshot();
    expect(markdown.render()).toMatchSnapshot();
  });
});

describe('csharp', () => {
  const transpile = new CSharpTranspile();
  test('snapshot', () => {
    const enu = new Enum(transpile, findEnum()).toJson();
    const markdown = Enum.toMarkdown(enu, { language: Language.CSHARP, ...metadata });
    expect(enu).toMatchSnapshot();
    expect(markdown.render()).toMatchSnapshot();
  });
});
