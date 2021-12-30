import * as reflect from 'jsii-reflect';
import { Language } from '../../../lib';
import { CSharpTranspile } from '../../../src/docgen/transpile/csharp';
import { JavaTranspile } from '../../../src/docgen/transpile/java';
import { PythonTranspile } from '../../../src/docgen/transpile/python';
import { TypeScriptTranspile } from '../../../src/docgen/transpile/typescript';
import { Struct } from '../../../src/docgen/view/struct';
import { Assemblies } from '../assemblies';

const assembly: reflect.Assembly = Assemblies.instance.withoutSubmodules;

const metadata = {
  packageName: assembly.name,
  packageVersion: assembly.version,
};

const findStruct = (): reflect.InterfaceType => {
  for (const iface of assembly.interfaces) {
    if (iface.datatype) {
      return iface;
    }
  }
  throw new Error('Assembly does not contain a struct');
};

describe('python', () => {
  const transpile = new PythonTranspile();
  test('snapshot', () => {
    const struct = new Struct(transpile, findStruct()).toJson();
    const markdown = Struct.toMarkdown(struct, { language: Language.PYTHON, ...metadata });
    expect(struct).toMatchSnapshot();
    expect(markdown.render()).toMatchSnapshot();
  });
});

describe('typescript', () => {
  const transpile = new TypeScriptTranspile();
  test('snapshot', () => {
    const struct = new Struct(transpile, findStruct()).toJson();
    const markdown = Struct.toMarkdown(struct, { language: Language.TYPESCRIPT, ...metadata });
    expect(struct).toMatchSnapshot();
    expect(markdown.render()).toMatchSnapshot();
  });
});

describe('java', () => {
  const transpile = new JavaTranspile();
  test('snapshot', () => {
    const struct = new Struct(transpile, findStruct()).toJson();
    const markdown = Struct.toMarkdown(struct, { language: Language.JAVA, ...metadata });
    expect(struct).toMatchSnapshot();
    expect(markdown.render()).toMatchSnapshot();
  });
});

describe('csharp', () => {
  const transpile = new CSharpTranspile();
  test('snapshot', () => {
    const struct = new Struct(transpile, findStruct()).toJson();
    const markdown = Struct.toMarkdown(struct, { language: Language.CSHARP, ...metadata });
    expect(struct).toMatchSnapshot();
    expect(markdown.render()).toMatchSnapshot();
  });
});
