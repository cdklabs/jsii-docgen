import * as reflect from 'jsii-reflect';
import { CSharpTranspile } from '../../../src/docgen/transpile/csharp';
import { JavaTranspile } from '../../../src/docgen/transpile/java';
import { PythonTranspile } from '../../../src/docgen/transpile/python';
import { TypeScriptTranspile } from '../../../src/docgen/transpile/typescript';
import { Enum } from '../../../src/docgen/view/enum';
import { Assemblies } from '../assemblies';

const assembly: reflect.Assembly = Assemblies.instance.withoutSubmodules;

describe('python', () => {
  const transpile = new PythonTranspile();
  test('snapshot', () => {
    const enu = new Enum(transpile, assembly.enums[0]);
    expect(enu.toMarkdown().render()).toMatchSnapshot();
  });
});

describe('typescript', () => {
  const transpile = new TypeScriptTranspile();
  test('markdown snapshot', () => {
    const enu = new Enum(transpile, assembly.enums[0]);
    expect(enu.toMarkdown().render()).toMatchSnapshot();
  });

  test('json snapshot', () => {
    const enu = new Enum(transpile, assembly.enums[0]);
    expect(enu.toJson()).toMatchSnapshot();
  });
});

describe('java', () => {
  const transpile = new JavaTranspile();
  test('markdown snapshot', () => {
    const enu = new Enum(transpile, assembly.enums[0]);
    expect(enu.toMarkdown().render()).toMatchSnapshot();
  });

  test('json snapshot', () => {
    const enu = new Enum(transpile, assembly.enums[0]);
    expect(enu.toJson()).toMatchSnapshot();
  });
});

describe('csharp', () => {
  const transpile = new CSharpTranspile();
  test('markdown snapshot', () => {
    const enu = new Enum(transpile, assembly.enums[0]);
    expect(enu.toMarkdown().render()).toMatchSnapshot();
  });

  test('json snapshot', () => {
    const enu = new Enum(transpile, assembly.enums[0]);
    expect(enu.toJson()).toMatchSnapshot();
  });
});
