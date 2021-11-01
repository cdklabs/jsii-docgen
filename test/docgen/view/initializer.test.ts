import * as reflect from 'jsii-reflect';
import { CSharpTranspile } from '../../../src/docgen/transpile/csharp';
import { JavaTranspile } from '../../../src/docgen/transpile/java';
import { PythonTranspile } from '../../../src/docgen/transpile/python';
import { TranspiledType } from '../../../src/docgen/transpile/transpile';
import { TypeScriptTranspile } from '../../../src/docgen/transpile/typescript';
import { Initializer } from '../../../src/docgen/view/initializer';
import { Assemblies } from '../assemblies';

const assembly: reflect.Assembly = Assemblies.instance.withoutSubmodules;

const findInitializer = (): reflect.Initializer => {
  for (const klass of assembly.system.classes) {
    if (klass.initializer) {
      return klass.initializer;
    }
  }
  throw new Error('Assembly does not contain an initializer');
};

describe('python', () => {
  const transpile = new PythonTranspile();
  test('markdown snapshot', () => {
    const initializer = new Initializer(transpile, findInitializer());
    expect(initializer.toMarkdown((t: TranspiledType) => `#${t.fqn}`).render()).toMatchSnapshot();
  });

  test('json snapshot', () => {
    const initializer = new Initializer(transpile, findInitializer());
    expect(initializer.toJson()).toMatchSnapshot();
  });
});

describe('typescript', () => {
  const transpile = new TypeScriptTranspile();
  test('markdown snapshot', () => {
    const initializer = new Initializer(transpile, findInitializer());
    expect(initializer.toMarkdown((t: TranspiledType) => `#${t.fqn}`).render()).toMatchSnapshot();
  });

  test('json snapshot', () => {
    const initializer = new Initializer(transpile, findInitializer());
    expect(initializer.toJson()).toMatchSnapshot();
  });
});

describe('java', () => {
  const transpile = new JavaTranspile();
  test('markdown snapshot', () => {
    const initializer = new Initializer(transpile, findInitializer());
    expect(initializer.toMarkdown((t: TranspiledType) => `#${t.fqn}`).render()).toMatchSnapshot();
  });

  test('json snapshot', () => {
    const initializer = new Initializer(transpile, findInitializer());
    expect(initializer.toJson()).toMatchSnapshot();
  });
});

describe('csharp', () => {
  const transpile = new CSharpTranspile();
  test('markdown snapshot', () => {
    const initializer = new Initializer(transpile, findInitializer());
    expect(initializer.toMarkdown((t: TranspiledType) => `#${t.fqn}`).render()).toMatchSnapshot();
  });

  test('json snapshot', () => {
    const initializer = new Initializer(transpile, findInitializer());
    expect(initializer.toJson()).toMatchSnapshot();
  });
});
