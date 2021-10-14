import * as reflect from 'jsii-reflect';
import { CSharpTranspile } from '../../../src/docgen/transpile/csharp';
import { JavaTranspile } from '../../../src/docgen/transpile/java';
import { PythonTranspile } from '../../../src/docgen/transpile/python';
import { TranspiledType } from '../../../src/docgen/transpile/transpile';
import { TypeScriptTranspile } from '../../../src/docgen/transpile/typescript';
import { InstanceMethod } from '../../../src/docgen/view/instance-method';
import { Assemblies } from '../assemblies';

const assembly: reflect.Assembly = Assemblies.instance.withoutSubmodules;

const findInstanceMethod = (): reflect.Method => {
  for (const klass of assembly.system.classes) {
    for (const method of klass.ownMethods) {
      if (!method.static) {
        return method;
      }
    }
  }
  throw new Error('Assembly does not contain an instance method');
};

describe('python', () => {
  const transpile = new PythonTranspile();
  test('snapshot', () => {
    const instanceMethod = new InstanceMethod(transpile, findInstanceMethod(), (t: TranspiledType) => `#${t.fqn}`);
    expect(instanceMethod.render().render()).toMatchSnapshot();
  });
});

describe('typescript', () => {
  const transpile = new TypeScriptTranspile();
  test('snapshot', () => {
    const instanceMethod = new InstanceMethod(transpile, findInstanceMethod(), (t: TranspiledType) => `#${t.fqn}`);
    expect(instanceMethod.render().render()).toMatchSnapshot();
  });
});

describe('java', () => {
  const transpile = new JavaTranspile();
  test('snapshot', () => {
    const instanceMethod = new InstanceMethod(transpile, findInstanceMethod(), (t: TranspiledType) => `#${t.fqn}`);
    expect(instanceMethod.render().render()).toMatchSnapshot();
  });
});

describe('csharp', () => {
  const transpile = new CSharpTranspile();
  test('snapshot', () => {
    const instanceMethod = new InstanceMethod(transpile, findInstanceMethod(), (t: TranspiledType) => `#${t.fqn}`);
    expect(instanceMethod.render().render()).toMatchSnapshot();
  });
});
