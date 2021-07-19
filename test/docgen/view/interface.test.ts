import * as reflect from 'jsii-reflect';
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
  test('snapshot', () => {
    const klass = new Interface(transpile, findInterface(), (t: TranspiledType) => `#${t.fqn}`);
    expect(klass.toMarkdown().render()).toMatchSnapshot();
  });
});

describe('typescript', () => {
  const transpile = new TypeScriptTranspile();
  test('snapshot', () => {
    const klass = new Interface(transpile, findInterface(), (t: TranspiledType) => `#${t.fqn}`);
    expect(klass.toMarkdown().render()).toMatchSnapshot();
  });
});
