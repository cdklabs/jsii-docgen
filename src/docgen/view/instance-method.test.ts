import * as reflect from 'jsii-reflect';
import { PythonTranspile } from '../transpile/python';
import { TypeScriptTranspile } from '../transpile/typescript';
import { InstanceMethod } from './instance-method';

const assembly: reflect.Assembly = (global as any).assembly;

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
    const instanceMethod = new InstanceMethod(transpile, findInstanceMethod());
    expect(instanceMethod.render().render()).toMatchSnapshot();
  });
});

describe('typescript', () => {
  const transpile = new TypeScriptTranspile();
  test('snapshot', () => {
    const instanceMethod = new InstanceMethod(transpile, findInstanceMethod());
    expect(instanceMethod.render().render()).toMatchSnapshot();
  });
});
