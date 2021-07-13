import * as reflect from 'jsii-reflect';
import { PythonTranspile } from '../../../src/docgen/transpile/python';
import { TranspiledType } from '../../../src/docgen/transpile/transpile';
import { TypeScriptTranspile } from '../../../src/docgen/transpile/typescript';
import { StaticFunction } from '../../../src/docgen/view/static-function';
import { Assemblies } from '../assemblies';

const assembly: reflect.Assembly = Assemblies.instance.withoutSubmodules;

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
    const staticFunction = new StaticFunction(transpile, findStaticFunction(), (t: TranspiledType) => `#${t.fqn}`);
    expect(staticFunction.render().render()).toMatchSnapshot();
  });
});

describe('typescript', () => {
  const transpile = new TypeScriptTranspile();
  test('snapshot', () => {
    const staticFunction = new StaticFunction(transpile, findStaticFunction(), (t: TranspiledType) => `#${t.fqn}`);
    expect(staticFunction.render().render()).toMatchSnapshot();
  });
});
