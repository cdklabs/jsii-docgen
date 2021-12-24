import * as reflect from 'jsii-reflect';
import { CSharpTranspile } from '../../../src/docgen/transpile/csharp';
import { JavaTranspile } from '../../../src/docgen/transpile/java';
import { PythonTranspile } from '../../../src/docgen/transpile/python';
import { Language } from '../../../src/docgen/transpile/transpile';
import { TypeScriptTranspile } from '../../../src/docgen/transpile/typescript';
import { Interface } from '../../../src/docgen/view/interface';
import { Assemblies } from '../assemblies';

const assembly: reflect.Assembly = Assemblies.instance.withoutSubmodules;

const findInterface = () => {
  for (const iface of assembly.interfaces) {
    if (!iface.datatype) {
      return iface;
    }
  }
  throw new Error('Assembly does not contain an interface');
};

describe('python', () => {
  const transpile = new PythonTranspile();
  test('snapshot', () => {
    const iface = new Interface(transpile, findInterface()).toJson();
    const markdown = Interface.toMarkdown(iface, { language: Language.PYTHON });
    expect(iface).toMatchSnapshot();
    expect(markdown.render()).toMatchSnapshot();
  });
});

describe('typescript', () => {
  const transpile = new TypeScriptTranspile();
  test('snapshot', () => {
    const iface = new Interface(transpile, findInterface()).toJson();
    const markdown = Interface.toMarkdown(iface, { language: Language.TYPESCRIPT });
    expect(iface).toMatchSnapshot();
    expect(markdown.render()).toMatchSnapshot();
  });
});

describe('java', () => {
  const transpile = new JavaTranspile();
  test('snapshot', () => {
    const iface = new Interface(transpile, findInterface()).toJson();
    const markdown = Interface.toMarkdown(iface, { language: Language.JAVA });
    expect(iface).toMatchSnapshot();
    expect(markdown.render()).toMatchSnapshot();
  });
});

describe('csharp', () => {
  const transpile = new CSharpTranspile();
  test('snapshot', () => {
    const iface = new Interface(transpile, findInterface()).toJson();
    const markdown = Interface.toMarkdown(iface, { language: Language.CSHARP });
    expect(iface).toMatchSnapshot();
    expect(markdown.render()).toMatchSnapshot();
  });
});
