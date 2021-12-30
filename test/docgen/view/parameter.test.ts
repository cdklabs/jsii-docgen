import * as reflect from 'jsii-reflect';
import { Language } from '../../../lib';
import { CSharpTranspile } from '../../../src/docgen/transpile/csharp';
import { JavaTranspile } from '../../../src/docgen/transpile/java';
import { PythonTranspile } from '../../../src/docgen/transpile/python';
import { TypeScriptTranspile } from '../../../src/docgen/transpile/typescript';
import { Parameter } from '../../../src/docgen/view/parameter';
import { Assemblies } from '../assemblies';

const assembly: reflect.Assembly = Assemblies.instance.withoutSubmodules;

const metadata = {
  packageName: assembly.name,
  packageVersion: assembly.version,
};

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
    const parameter = new Parameter(transpile, findParameter()).toJson();
    const markdown = Parameter.toMarkdown(parameter, { language: Language.PYTHON, ...metadata });
    expect(parameter).toMatchSnapshot();
    expect(markdown.render()).toMatchSnapshot();
  });
});

describe('typescript', () => {
  const transpile = new TypeScriptTranspile();
  test('snapshot', () => {
    const parameter = new Parameter(transpile, findParameter()).toJson();
    const markdown = Parameter.toMarkdown(parameter, { language: Language.TYPESCRIPT, ...metadata });
    expect(parameter).toMatchSnapshot();
    expect(markdown.render()).toMatchSnapshot();
  });
});

describe('java', () => {
  const transpile = new JavaTranspile();
  test('snapshot', () => {
    const parameter = new Parameter(transpile, findParameter()).toJson();
    const markdown = Parameter.toMarkdown(parameter, { language: Language.JAVA, ...metadata });
    expect(parameter).toMatchSnapshot();
    expect(markdown.render()).toMatchSnapshot();
  });
});

describe('csharp', () => {
  const transpile = new CSharpTranspile();
  test('snapshot', () => {
    const parameter = new Parameter(transpile, findParameter()).toJson();
    const markdown = Parameter.toMarkdown(parameter, { language: Language.CSHARP, ...metadata });
    expect(parameter).toMatchSnapshot();
    expect(markdown.render()).toMatchSnapshot();
  });
});

describe('newlines in "defaults" are removed', () => {
  const transpile = new TypeScriptTranspile();
  test('snapshot', () => {
    const reflectParameter = findParameter();
    reflectParameter.spec.docs = { default: 'default option\nwith a newline' };
    const docgenParameter = new Parameter(transpile, findParameter()).toJson();
    // TODO: make more specific
    expect(docgenParameter).toMatchSnapshot();
  });
});
