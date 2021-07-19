import * as reflect from 'jsii-reflect';
import { PythonTranspile } from '../../../src/docgen/transpile/python';
import { TranspiledType } from '../../../src/docgen/transpile/transpile';
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
      (t: TranspiledType) => `#${t.fqn}`,
    );
    expect(struct.toMarkdown().render()).toMatchSnapshot();
  });
});

describe('typescript', () => {
  const transpile = new TypeScriptTranspile();
  test('snapshot', () => {
    const struct = new Struct(
      transpile,
      assembly.system.interfaces.filter((i) => i.datatype)[0],
      (t: TranspiledType) => `#${t.fqn}`,
    );
    expect(struct.toMarkdown().render()).toMatchSnapshot();
  });
});
