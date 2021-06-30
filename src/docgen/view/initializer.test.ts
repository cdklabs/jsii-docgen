import * as reflect from 'jsii-reflect';
import { PythonTranspile } from '../transpile/python';
import { TypeScriptTranspile } from '../transpile/typescript';
import { Initializer } from './initializer';

const assembly: reflect.Assembly = (global as any).assembly;

const findInitializer = (): reflect.Initializer => {
  for (const klass of assembly.system.classes) {
    if (klass.initializer) {
      return klass.initializer;
    }
  }
  throw new Error('Assembly does not contain an initializer');
};

describe('python', () => {
  const transpile = new PythonTranspile();
  test('snapshot', () => {
    const initializer = new Initializer(transpile, findInitializer());
    expect(initializer.render().render()).toMatchSnapshot();
  });
});

describe('typescript', () => {
  const transpile = new TypeScriptTranspile();
  test('snapshot', () => {
    const initializer = new Initializer(transpile, findInitializer());
    expect(initializer.render().render()).toMatchSnapshot();
  });
});
