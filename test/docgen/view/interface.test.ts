import * as reflect from 'jsii-reflect';
import { CSharpTranspile } from '../../../src/docgen/transpile/csharp';
import { JavaTranspile } from '../../../src/docgen/transpile/java';
import { PythonTranspile } from '../../../src/docgen/transpile/python';
import { TranspiledType } from '../../../src/docgen/transpile/transpile';
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
  test('markdown snapshot', () => {
    const klass = new Interface(transpile, findInterface());
    expect(klass.toMarkdown((t: TranspiledType) => `#${t.fqn}`).render()).toMatchSnapshot();
  });

  test('json snapshot', () => {
    const klass = new Interface(transpile, findInterface());
    expect(klass.toJson()).toMatchSnapshot();
  });
});

describe('typescript', () => {
  const transpile = new TypeScriptTranspile();
  test('markdown snapshot', () => {
    const klass = new Interface(transpile, findInterface());
    expect(klass.toMarkdown((t: TranspiledType) => `#${t.fqn}`).render()).toMatchSnapshot();
  });

  test('json snapshot', () => {
    const klass = new Interface(transpile, findInterface());
    expect(klass.toJson()).toMatchSnapshot();
  });
});

describe('java', () => {
  const transpile = new JavaTranspile();
  test('markdown snapshot', () => {
    const klass = new Interface(transpile, findInterface());
    expect(klass.toMarkdown((t: TranspiledType) => `#${t.fqn}`).render()).toMatchSnapshot();
  });

  test('json snapshot', () => {
    const klass = new Interface(transpile, findInterface());
    expect(klass.toJson()).toMatchSnapshot();
  });
});

describe('csharp', () => {
  const transpile = new CSharpTranspile();
  test('markdown snapshot', () => {
    const klass = new Interface(transpile, findInterface());
    expect(klass.toMarkdown((t: TranspiledType) => `#${t.fqn}`).render()).toMatchSnapshot();
  });

  test('json snapshot', () => {
    const klass = new Interface(transpile, findInterface());
    expect(klass.toJson()).toMatchSnapshot();
  });
});
