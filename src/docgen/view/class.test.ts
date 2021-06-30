import * as reflect from 'jsii-reflect';
import { PythonTranspile } from '../transpile/python';
import { TypeScriptTranspile } from '../transpile/typescript';
import { Class } from './class';

const assembly: reflect.Assembly = (global as any).assembly;

describe('python', () => {
  const transpile = new PythonTranspile();
  test('snapshot', () => {
    const klass = new Class(transpile, assembly.classes[0]);
    expect(klass.render().render()).toMatchSnapshot();
  });
});

describe('typescript', () => {
  const transpile = new TypeScriptTranspile();
  test('snapshot', () => {
    const klass = new Class(transpile, assembly.classes[0]);
    expect(klass.render().render()).toMatchSnapshot();
  });
});
