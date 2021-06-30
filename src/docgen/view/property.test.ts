import * as reflect from 'jsii-reflect';
import { PythonTranspile } from '../transpile/python';
import { TypeScriptTranspile } from '../transpile/typescript';
import { Property } from './property';

const assembly: reflect.Assembly = (global as any).assembly;

describe('python', () => {
  const transpile = new PythonTranspile();
  test('snapshot', () => {
    const parameter = new Property(
      transpile,
      assembly.system.interfaces[0].allProperties[0],
    );
    expect(parameter.render().render()).toMatchSnapshot();
  });
});

describe('typescript', () => {
  const transpile = new TypeScriptTranspile();
  test('snapshot', () => {
    const parameter = new Property(
      transpile,
      assembly.system.interfaces[0].allProperties[0],
    );
    expect(parameter.render().render()).toMatchSnapshot();
  });
});
