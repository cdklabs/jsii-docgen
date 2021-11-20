import * as reflect from 'jsii-reflect';
import { CSharpTranspile } from '../../../src/docgen/transpile/csharp';
import { JavaTranspile } from '../../../src/docgen/transpile/java';
import { PythonTranspile } from '../../../src/docgen/transpile/python';
import { TranspiledType } from '../../../src/docgen/transpile/transpile';
import { TypeScriptTranspile } from '../../../src/docgen/transpile/typescript';
import { Parameter } from '../../../src/docgen/view/parameter';
import { Assemblies } from '../assemblies';

const assembly: reflect.Assembly = Assemblies.instance.withoutSubmodules;

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
    const parameter = new Parameter(transpile, findParameter(), (t: TranspiledType) => `#${t.fqn}`);
    expect(parameter.render().render()).toMatchSnapshot();
  });
});

describe('typescript', () => {
  const transpile = new TypeScriptTranspile();
  test('snapshot', () => {
    const parameter = new Parameter(transpile, findParameter(), (t: TranspiledType) => `#${t.fqn}`);
    expect(parameter.render().render()).toMatchSnapshot();
  });
});

describe('java', () => {
  const transpile = new JavaTranspile();
  test('snapshot', () => {
    const parameter = new Parameter(transpile, findParameter(), (t: TranspiledType) => `#${t.fqn}`);
    expect(parameter.render().render()).toMatchSnapshot();
  });
});

describe('csharp', () => {
  const transpile = new CSharpTranspile();
  test('snapshot', () => {
    const parameter = new Parameter(transpile, findParameter(), (t: TranspiledType) => `#${t.fqn}`);
    expect(parameter.render().render()).toMatchSnapshot();
  });
});

describe('newlines in "defaults" are removed', () => {
  const transpile = new TypeScriptTranspile();
  test('snapshot', () => {
    const reflectParameter = findParameter();
    reflectParameter.spec.docs = { default: 'default option\nwith a newline' };
    const docgenParameter = new Parameter(transpile, findParameter(), (t: TranspiledType) => `#${t.fqn}`);
    expect(docgenParameter.render().render()).toMatchSnapshot();
  });
});
