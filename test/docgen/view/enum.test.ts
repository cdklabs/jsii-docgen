import * as reflect from 'jsii-reflect';
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
  test('snapshot', () => {
    const enu = new Enum(transpile, assembly.enums[0]);
    expect(enu.toMarkdown().render()).toMatchSnapshot();
  });
});
