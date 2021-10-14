import * as reflect from 'jsii-reflect';
import { CSharpTranspile } from '../../../src/docgen/transpile/csharp';
import { JavaTranspile } from '../../../src/docgen/transpile/java';
import { PythonTranspile } from '../../../src/docgen/transpile/python';
import { TranspiledType } from '../../../src/docgen/transpile/transpile';
import { TypeScriptTranspile } from '../../../src/docgen/transpile/typescript';
import { Class } from '../../../src/docgen/view/class';
import { Assemblies } from '../assemblies';

const assembly: reflect.Assembly = Assemblies.instance.withoutSubmodules;

describe('python', () => {
  const transpile = new PythonTranspile();
  test('snapshot', () => {
    const klass = new Class(transpile, assembly.classes[0], (t: TranspiledType) => `#${t.fqn}`);
    expect(klass.render().render()).toMatchSnapshot();
  });
});

describe('typescript', () => {
  const transpile = new TypeScriptTranspile();
  test('snapshot', () => {
    const klass = new Class(transpile, assembly.classes[0], (t: TranspiledType) => `#${t.fqn}`);
    expect(klass.render().render()).toMatchSnapshot();
  });
});

describe('java', () => {
  const transpile = new JavaTranspile();
  test('snapshot', () => {
    const klass = new Class(transpile, assembly.classes[0], (t: TranspiledType) => `#${t.fqn}`);
    expect(klass.render().render()).toMatchSnapshot();
  });
});

describe('csharp', () => {
  const transpile = new CSharpTranspile();
  test('snapshot', () => {
    const klass = new Class(transpile, assembly.classes[0], (t: TranspiledType) => `#${t.fqn}`);
    expect(klass.render().render()).toMatchSnapshot();
  });
});
