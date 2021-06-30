import * as reflect from 'jsii-reflect';
import { PythonTranspile } from '../transpile/python';
import { TypeScriptTranspile } from '../transpile/typescript';
import { Parameter } from './parameter';

const assembly: reflect.Assembly = (global as any).assembly;

const findParameter = (): reflect.Parameter => {
  for (const klass of assembly.system.classes) {
    for (const method of klass.ownMethods) {
      if (method.parameters.length > 0) {
        return method.parameters[0];
      }
    }
  }
  throw new Error('Assembly does not contain a parameter');
};

describe('python', () => {
  const transpile = new PythonTranspile();
  test('snapshot', () => {
    const parameter = new Parameter(transpile, findParameter());
    expect(parameter.render().render()).toMatchSnapshot();
  });
});

describe('typescript', () => {
  const transpile = new TypeScriptTranspile();
  test('snapshot', () => {
    const parameter = new Parameter(transpile, findParameter());
    expect(parameter.render().render()).toMatchSnapshot();
  });
});
