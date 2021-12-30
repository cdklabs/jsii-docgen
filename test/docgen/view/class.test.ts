import * as reflect from 'jsii-reflect';
import { Language } from '../../../lib';
import { CSharpTranspile } from '../../../src/docgen/transpile/csharp';
import { JavaTranspile } from '../../../src/docgen/transpile/java';
import { PythonTranspile } from '../../../src/docgen/transpile/python';
import { TypeScriptTranspile } from '../../../src/docgen/transpile/typescript';
import { Class } from '../../../src/docgen/view/class';
import { Assemblies } from '../assemblies';

const assembly: reflect.Assembly = Assemblies.instance.withoutSubmodules;

const metadata = {
  packageName: assembly.name,
  packageVersion: assembly.version,
};

const findClass = (): reflect.ClassType => {
  if (assembly.classes[0]) {
    return assembly.classes[0];
  }
  throw new Error('Assembly does not contain a class');
};

describe('python', () => {
  const transpile = new PythonTranspile();
  test('snapshot', () => {
    const klass = new Class(transpile, findClass()).toJson();
    const markdown = Class.toMarkdown(klass, { language: Language.PYTHON, ...metadata });
    expect(klass).toMatchSnapshot();
    expect(markdown.render()).toMatchSnapshot();
  });
});

describe('typescript', () => {
  const transpile = new TypeScriptTranspile();
  test('snapshot', () => {
    const klass = new Class(transpile, findClass()).toJson();
    const markdown = Class.toMarkdown(klass, { language: Language.TYPESCRIPT, ...metadata });
    expect(klass).toMatchSnapshot();
    expect(markdown.render()).toMatchSnapshot();
  });
});

describe('java', () => {
  const transpile = new JavaTranspile();
  test('snapshot', () => {
    const klass = new Class(transpile, findClass()).toJson();
    const markdown = Class.toMarkdown(klass, { language: Language.JAVA, ...metadata });
    expect(klass).toMatchSnapshot();
    expect(markdown.render()).toMatchSnapshot();
  });
});

describe('csharp', () => {
  const transpile = new CSharpTranspile();
  test('snapshot', () => {
    const klass = new Class(transpile, findClass()).toJson();
    const markdown = Class.toMarkdown(klass, { language: Language.CSHARP, ...metadata });
    expect(klass).toMatchSnapshot();
    expect(markdown.render()).toMatchSnapshot();
  });
});
