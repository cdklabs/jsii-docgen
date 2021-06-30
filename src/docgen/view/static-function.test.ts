import * as reflect from 'jsii-reflect';
import { PythonTranspile } from '../transpile/python';
import { TypeScriptTranspile } from '../transpile/typescript';
import { StaticFunction } from './static-function';

const assembly: reflect.Assembly = (global as any).assembly;

const findStaticFunction = (): reflect.Method => {
  for (const klass of assembly.system.classes) {
    for (const method of klass.ownMethods) {
      if (method.static) {
        return method;
      }
    }
  }
  throw new Error('Assembly does not contain a static function');
};

describe('python', () => {
  const transpile = new PythonTranspile();
  test('snapshot', () => {
    const staticFunction = new StaticFunction(transpile, findStaticFunction());
    expect(staticFunction.render().render()).toMatchSnapshot();
  });
});

describe('typescript', () => {
  const transpile = new TypeScriptTranspile();
  test('snapshot', () => {
    const staticFunction = new StaticFunction(transpile, findStaticFunction());
    expect(staticFunction.render().render()).toMatchSnapshot();
  });
});
