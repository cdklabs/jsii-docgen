import * as reflect from 'jsii-reflect';
import { CSharpTranspile } from '../../../src/docgen/transpile/csharp';
import { JavaTranspile } from '../../../src/docgen/transpile/java';
import { PythonTranspile } from '../../../src/docgen/transpile/python';
import { TranspiledType } from '../../../src/docgen/transpile/transpile';
import { TypeScriptTranspile } from '../../../src/docgen/transpile/typescript';
import { Property } from '../../../src/docgen/view/property';
import { Assemblies } from '../assemblies';

const assembly: reflect.Assembly = Assemblies.instance.withoutSubmodules;

describe('python', () => {
  const transpile = new PythonTranspile();
  test('markdown snapshot', () => {
    const parameter = new Property(
      transpile,
      assembly.system.interfaces[0].allProperties[0],
    );
    expect(parameter.toMarkdown((t: TranspiledType) => `#${t.fqn}`).render()).toMatchSnapshot();
  });

  test('json snapshot', () => {
    const parameter = new Property(
      transpile,
      assembly.system.interfaces[0].allProperties[0],
    );
    expect(parameter.toJson()).toMatchSnapshot();
  });
});

describe('typescript', () => {
  const transpile = new TypeScriptTranspile();
  test('markdown snapshot', () => {
    const parameter = new Property(
      transpile,
      assembly.system.interfaces[0].allProperties[0],
    );
    expect(parameter.toMarkdown((t: TranspiledType) => `#${t.fqn}`).render()).toMatchSnapshot();
  });

  test('json snapshot', () => {
    const parameter = new Property(
      transpile,
      assembly.system.interfaces[0].allProperties[0],
    );
    expect(parameter.toJson()).toMatchSnapshot();
  });
});

describe('java', () => {
  const transpile = new JavaTranspile();
  test('markdown snapshot', () => {
    const parameter = new Property(
      transpile,
      assembly.system.interfaces[0].allProperties[0],
    );
    expect(parameter.toMarkdown((t: TranspiledType) => `#${t.fqn}`).render()).toMatchSnapshot();
  });

  test('json snapshot', () => {
    const parameter = new Property(
      transpile,
      assembly.system.interfaces[0].allProperties[0],
    );
    expect(parameter.toJson()).toMatchSnapshot();
  });
});

describe('csharp', () => {
  const transpile = new CSharpTranspile();
  test('markdown snapshot', () => {
    const parameter = new Property(
      transpile,
      assembly.system.interfaces[0].allProperties[0],
    );
    expect(parameter.toMarkdown((t: TranspiledType) => `#${t.fqn}`).render()).toMatchSnapshot();
  });

  test('json snapshot', () => {
    const parameter = new Property(
      transpile,
      assembly.system.interfaces[0].allProperties[0],
    );
    expect(parameter.toJson()).toMatchSnapshot();
  });
});
