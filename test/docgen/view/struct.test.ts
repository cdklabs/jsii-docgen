import * as reflect from 'jsii-reflect';
import { Language } from '../../../lib';
import { CSharpTranspile } from '../../../src/docgen/transpile/csharp';
import { JavaTranspile } from '../../../src/docgen/transpile/java';
import { PythonTranspile } from '../../../src/docgen/transpile/python';
import { TypeScriptTranspile } from '../../../src/docgen/transpile/typescript';
import { Struct } from '../../../src/docgen/view/struct';
import { Assemblies } from '../assemblies';

const assembly: reflect.Assembly = Assemblies.instance.withoutSubmodules;

describe('python', () => {
  const transpile = new PythonTranspile();
  test('snapshot', () => {
    const struct = new Struct(
      transpile,
      assembly.system.interfaces.filter((i) => i.datatype)[0],
    ).toJson();
    const markdown = Struct.toMarkdown(struct, { language: Language.PYTHON });
    expect(struct).toMatchSnapshot();
    expect(markdown.render()).toMatchSnapshot();
  });
});

describe('typescript', () => {
  const transpile = new TypeScriptTranspile();
  test('snapshot', () => {
    const struct = new Struct(
      transpile,
      assembly.system.interfaces.filter((i) => i.datatype)[0],
    ).toJson();
    const markdown = Struct.toMarkdown(struct, { language: Language.PYTHON });
    expect(struct).toMatchSnapshot();
    expect(markdown.render()).toMatchSnapshot();
  });
});

describe('java', () => {
  const transpile = new JavaTranspile();
  test('snapshot', () => {
    const struct = new Struct(
      transpile,
      assembly.system.interfaces.filter((i) => i.datatype)[0],
    ).toJson();
    const markdown = Struct.toMarkdown(struct, { language: Language.PYTHON });
    expect(struct).toMatchSnapshot();
    expect(markdown.render()).toMatchSnapshot();
  });
});

describe('csharp', () => {
  const transpile = new CSharpTranspile();
  test('snapshot', () => {
    const struct = new Struct(
      transpile,
      assembly.system.interfaces.filter((i) => i.datatype)[0],
    ).toJson();
    const markdown = Struct.toMarkdown(struct, { language: Language.PYTHON });
    expect(struct).toMatchSnapshot();
    expect(markdown.render()).toMatchSnapshot();
  });
});
