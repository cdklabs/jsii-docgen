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
    expect(enu.render().render()).toMatchSnapshot();
  });
});

describe('typescript', () => {
  const transpile = new TypeScriptTranspile();
  test('snapshot', () => {
    const enu = new Enum(transpile, assembly.enums[0]);
    expect(enu.render().render()).toMatchSnapshot();
  });
});

describe('java', () => {
  const transpile = new JavaTranspile();
  test('snapshot', () => {
    const enu = new Enum(transpile, assembly.enums[0]);
    expect(enu.render().render()).toMatchSnapshot();
  });
});

describe('csharp', () => {
  const transpile = new CSharpTranspile();
  test('snapshot', () => {
    const enu = new Enum(transpile, assembly.enums[0]);
    expect(enu.render().render()).toMatchSnapshot();
  });
});
