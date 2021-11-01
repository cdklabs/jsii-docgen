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
  test('markdown snapshot', () => {
    const parameter = new Parameter(transpile, findParameter());
    expect(parameter.toMarkdown((t: TranspiledType) => `#${t.fqn}`).render()).toMatchSnapshot();
  });

  test('json snapshot', () => {
    const parameter = new Parameter(transpile, findParameter());
    expect(parameter.toJson()).toMatchSnapshot();
  });
});

describe('typescript', () => {
  const transpile = new TypeScriptTranspile();
  test('markdown snapshot', () => {
    const parameter = new Parameter(transpile, findParameter());
    expect(parameter.toMarkdown((t: TranspiledType) => `#${t.fqn}`).render()).toMatchSnapshot();
  });

  test('json snapshot', () => {
    const parameter = new Parameter(transpile, findParameter());
    expect(parameter.toJson()).toMatchSnapshot();
  });
});

describe('java', () => {
  const transpile = new JavaTranspile();
  test('markdown snapshot', () => {
    const parameter = new Parameter(transpile, findParameter());
    expect(parameter.toMarkdown((t: TranspiledType) => `#${t.fqn}`).render()).toMatchSnapshot();
  });

  test('json snapshot', () => {
    const parameter = new Parameter(transpile, findParameter());
    expect(parameter.toJson()).toMatchSnapshot();
  });
});

describe('csharp', () => {
  const transpile = new CSharpTranspile();
  test('markdown snapshot', () => {
    const parameter = new Parameter(transpile, findParameter());
    expect(parameter.toMarkdown((t: TranspiledType) => `#${t.fqn}`).render()).toMatchSnapshot();
  });

  test('json snapshot', () => {
    const parameter = new Parameter(transpile, findParameter());
    expect(parameter.toJson()).toMatchSnapshot();
  });
});
