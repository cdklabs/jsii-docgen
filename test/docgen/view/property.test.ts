import * as reflect from 'jsii-reflect';
import { Language } from '../../../lib';
import { CSharpTranspile } from '../../../src/docgen/transpile/csharp';
import { JavaTranspile } from '../../../src/docgen/transpile/java';
import { PythonTranspile } from '../../../src/docgen/transpile/python';
import { TypeScriptTranspile } from '../../../src/docgen/transpile/typescript';
import { Property } from '../../../src/docgen/view/property';
import { Assemblies } from '../assemblies';

const assembly: reflect.Assembly = Assemblies.instance.withoutSubmodules;

const metadata = {
  packageName: assembly.name,
  packageVersion: assembly.version,
};

const findProperty = (): reflect.Property => {
  for (const iface of assembly.system.interfaces) {
    if (iface.allProperties.length > 0) {
      return iface.allProperties[0];
    }
  }
  throw new Error('Assembly does not contain a property');
};

describe('python', () => {
  const transpile = new PythonTranspile();
  test('snapshot', () => {
    const parameter = new Property(transpile, findProperty()).toJson();
    const markdown = Property.toMarkdown(parameter, { language: Language.PYTHON, ...metadata });
    expect(parameter).toMatchSnapshot();
    expect(markdown.render()).toMatchSnapshot();
  });
});

describe('typescript', () => {
  const transpile = new TypeScriptTranspile();
  test('snapshot', () => {
    const parameter = new Property(transpile, findProperty()).toJson();
    const markdown = Property.toMarkdown(parameter, { language: Language.TYPESCRIPT, ...metadata });
    expect(parameter).toMatchSnapshot();
    expect(markdown.render()).toMatchSnapshot();
  });
});

describe('java', () => {
  const transpile = new JavaTranspile();
  test('snapshot', () => {
    const parameter = new Property(transpile, findProperty()).toJson();
    const markdown = Property.toMarkdown(parameter, { language: Language.JAVA, ...metadata });
    expect(parameter).toMatchSnapshot();
    expect(markdown.render()).toMatchSnapshot();
  });
});

describe('csharp', () => {
  const transpile = new CSharpTranspile();
  test('snapshot', () => {
    const parameter = new Property(transpile, findProperty()).toJson();
    const markdown = Property.toMarkdown(parameter, { language: Language.CSHARP, ...metadata });
    expect(parameter).toMatchSnapshot();
    expect(markdown.render()).toMatchSnapshot();
  });
});
