import * as reflect from 'jsii-reflect';
import { Language } from '../../../lib';
import { CSharpTranspile } from '../../../src/docgen/transpile/csharp';
import { JavaTranspile } from '../../../src/docgen/transpile/java';
import { PythonTranspile } from '../../../src/docgen/transpile/python';
import { TypeScriptTranspile } from '../../../src/docgen/transpile/typescript';
import { Class } from '../../../src/docgen/view/class';
import { Assemblies } from '../assemblies';

const assembly: reflect.Assembly = Assemblies.instance.withoutSubmodules;

// TODO: reduce code duplication in tests

describe('python', () => {
  const transpile = new PythonTranspile();
  test('snapshot', () => {
    const klass = new Class(transpile, assembly.classes[0]).toJson();
    const markdown = Class.toMarkdown(klass, { language: Language.PYTHON });
    expect(klass).toMatchSnapshot();
    expect(markdown.render()).toMatchSnapshot();
  });
});

describe('typescript', () => {
  const transpile = new TypeScriptTranspile();
  test('snapshot', () => {
    const klass = new Class(transpile, assembly.classes[0]).toJson();
    const markdown = Class.toMarkdown(klass, { language: Language.TYPESCRIPT });
    expect(klass).toMatchSnapshot();
    expect(markdown.render()).toMatchSnapshot();
  });
});

describe('java', () => {
  const transpile = new JavaTranspile();
  test('snapshot', () => {
    const klass = new Class(transpile, assembly.classes[0]).toJson();
    const markdown = Class.toMarkdown(klass, { language: Language.JAVA });
    expect(klass).toMatchSnapshot();
    expect(markdown.render()).toMatchSnapshot();
  });
});

describe('csharp', () => {
  const transpile = new CSharpTranspile();
  test('snapshot', () => {
    const klass = new Class(transpile, assembly.classes[0]).toJson();
    const markdown = Class.toMarkdown(klass, { language: Language.CSHARP });
    expect(klass).toMatchSnapshot();
    expect(markdown.render()).toMatchSnapshot();
  });
});
