import * as reflect from 'jsii-reflect';
import { Language } from '../../../lib';
import { CSharpTranspile } from '../../../src/docgen/transpile/csharp';
import { JavaTranspile } from '../../../src/docgen/transpile/java';
import { PythonTranspile } from '../../../src/docgen/transpile/python';
import { TypeScriptTranspile } from '../../../src/docgen/transpile/typescript';
import { Initializer } from '../../../src/docgen/view/initializer';
import { Assemblies } from '../assemblies';

const assembly: reflect.Assembly = Assemblies.instance.withoutSubmodules;

const metadata = {
  packageName: assembly.name,
  packageVersion: assembly.version,
};

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
  test('snapshot', () => {
    const initializer = new Initializer(transpile, findInitializer()).toJson();
    const markdown = Initializer.toMarkdown(initializer, { language: Language.PYTHON, ...metadata });
    expect(initializer).toMatchSnapshot();
    expect(markdown.render()).toMatchSnapshot();
  });
});

describe('typescript', () => {
  const transpile = new TypeScriptTranspile();
  test('snapshot', () => {
    const initializer = new Initializer(transpile, findInitializer()).toJson();
    const markdown = Initializer.toMarkdown(initializer, { language: Language.TYPESCRIPT, ...metadata });
    expect(initializer).toMatchSnapshot();
    expect(markdown.render()).toMatchSnapshot();
  });
});

describe('java', () => {
  const transpile = new JavaTranspile();
  test('snapshot', () => {
    const initializer = new Initializer(transpile, findInitializer()).toJson();
    const markdown = Initializer.toMarkdown(initializer, { language: Language.JAVA, ...metadata });
    expect(initializer).toMatchSnapshot();
    expect(markdown.render()).toMatchSnapshot();
  });
});

describe('csharp', () => {
  const transpile = new CSharpTranspile();
  test('snapshot', () => {
    const initializer = new Initializer(transpile, findInitializer()).toJson();
    const markdown = Initializer.toMarkdown(initializer, { language: Language.CSHARP, ...metadata });
    expect(initializer).toMatchSnapshot();
    expect(markdown.render()).toMatchSnapshot();
  });
});
