import * as reflect from 'jsii-reflect';
import { PythonTranspile } from '../transpile/python';
import { TypeScriptTranspile } from '../transpile/typescript';
import { Enum } from './enum';

const assembly: reflect.Assembly = (global as any).assembly;

describe('python', () => {
  const transpile = new PythonTranspile();
  test('snapshot', () => {
    const enu = new Enum(transpile, assembly.enums[0]);
    expect(enu.render().render()).toMatchSnapshot();
  });
});

describe('typescript', () => {
  const transpile = new TypeScriptTranspile();
  test('snapshot', () => {
    const enu = new Enum(transpile, assembly.enums[0]);
    expect(enu.render().render()).toMatchSnapshot();
  });
});
