import * as spec from '@jsii/spec';
import * as reflect from 'jsii-reflect';
import { Language } from '../../../src';
import { MarkdownRenderer } from '../../../src/docgen/render/markdown-render';
import { JsiiEntity } from '../../../src/docgen/schema';
import { Class } from '../../../src/docgen/view/class';
import { LANGUAGE_SPECIFIC } from '../../../src/docgen/view/documentation';
import { Assemblies } from '../assemblies';

const assembly: reflect.Assembly = Assemblies.instance.withoutSubmodules;

const metadata = {
  packageName: assembly.name,
  packageVersion: assembly.version,
};

const findClass = (): reflect.ClassType => {
  if (assembly.classes[0]) {
    return assembly.classes[0];
  }
  throw new Error('Assembly does not contain a class');
};

test.each(Language.values())('%s snapshot', (language) => {
  const { transpile } = LANGUAGE_SPECIFIC[language.toString()];
  const markdown = new MarkdownRenderer({ language, ...metadata });
  const klass = new Class(transpile, findClass()).toJson();
  expect(klass).toMatchSnapshot();
  expect(markdown.visitClass(klass).render()).toMatchSnapshot();
});

const SYNTHETIC_ASSEMBLY = 'iface-inheritance';

const LANGUAGE_MODULE_PREFIX: Record<string, string> = {
  typescript: SYNTHETIC_ASSEMBLY,
  python: 'iface_inheritance',
  java: 'software.ifaceinheritance',
  csharp: 'IfaceInheritance',
  go: 'github.com/example/iface-inheritance/ifaceinheritance',
};

/**
 * IB extends IA; Base implements IB; Derived extends Base.
 * DiamondDerived extends DiamondBase (implements IB and IC, both of which extend IA)
 * and also re-declares IB so the same interface appears more than once.
 */
const syntheticAssembly = loadSyntheticInterfaceAssembly();
const derivedClass = syntheticAssembly.system.findClass(`${SYNTHETIC_ASSEMBLY}.Derived`);
const diamondDerivedClass = syntheticAssembly.system.findClass(`${SYNTHETIC_ASSEMBLY}.DiamondDerived`);

describe('inherited interfaces', () => {
  test.each(Language.values())('%s lists inherited interfaces exactly once with language-specific links', (language) => {
    const { transpile } = LANGUAGE_SPECIFIC[language.toString()];
    const documented = new Class(transpile, derivedClass).toJson().interfaces;

    expect(interfaceIds(documented)).toEqual([
      `${SYNTHETIC_ASSEMBLY}.IB`,
      `${SYNTHETIC_ASSEMBLY}.IA`,
    ]);
    expect(interfaceFqns(documented)).toEqual([
      languageFqn(language, 'IB'),
      languageFqn(language, 'IA'),
    ]);
  });

  test.each(Language.values())('%s lists diamond-inherited interfaces exactly once', (language) => {
    const { transpile } = LANGUAGE_SPECIFIC[language.toString()];
    const documented = new Class(transpile, diamondDerivedClass).toJson().interfaces;

    expect(interfaceIds(documented)).toEqual([
      `${SYNTHETIC_ASSEMBLY}.IB`,
      `${SYNTHETIC_ASSEMBLY}.IA`,
      `${SYNTHETIC_ASSEMBLY}.IC`,
    ]);
    expect(interfaceFqns(documented)).toEqual([
      languageFqn(language, 'IB'),
      languageFqn(language, 'IA'),
      languageFqn(language, 'IC'),
    ]);
  });
});

function interfaceIds(ifaces: JsiiEntity[]): string[] {
  return ifaces.map((iface) => iface.id);
}

function interfaceFqns(ifaces: JsiiEntity[]): string[] {
  return ifaces.map((iface) => iface.fqn);
}

function languageFqn(language: Language, typeName: string): string {
  const prefix = LANGUAGE_MODULE_PREFIX[language.toString()];
  if (!prefix) {
    throw new Error(`Missing module prefix for language ${language}`);
  }
  return `${prefix}.${typeName}`;
}

function loadSyntheticInterfaceAssembly(): reflect.Assembly {
  const typeSystem = new reflect.TypeSystem();
  const assemblySpec: spec.Assembly = {
    schema: spec.SchemaVersion.LATEST,
    name: SYNTHETIC_ASSEMBLY,
    version: '1.0.0',
    description: 'synthetic assembly for inherited class interface tests',
    homepage: 'https://example.com',
    repository: { type: 'git', url: 'https://example.com' },
    author: { name: 'test', roles: ['author'] },
    license: 'Apache-2.0',
    fingerprint: 'synthetic',
    jsiiVersion: '1.142.0',
    targets: {
      js: { npm: SYNTHETIC_ASSEMBLY },
      python: { distName: SYNTHETIC_ASSEMBLY, module: 'iface_inheritance' },
      java: {
        package: 'software.ifaceinheritance',
        maven: { groupId: 'software.ifaceinheritance', artifactId: SYNTHETIC_ASSEMBLY },
      },
      dotnet: { namespace: 'IfaceInheritance', packageId: 'IfaceInheritance' },
      go: { moduleName: 'github.com/example/iface-inheritance' },
    },
    types: {
      [`${SYNTHETIC_ASSEMBLY}.IA`]: interfaceType('IA'),
      [`${SYNTHETIC_ASSEMBLY}.IB`]: interfaceType('IB', ['IA']),
      [`${SYNTHETIC_ASSEMBLY}.IC`]: interfaceType('IC', ['IA']),
      [`${SYNTHETIC_ASSEMBLY}.Base`]: classType('Base', { interfaces: ['IB'] }),
      [`${SYNTHETIC_ASSEMBLY}.Derived`]: classType('Derived', { base: 'Base' }),
      [`${SYNTHETIC_ASSEMBLY}.DiamondBase`]: classType('DiamondBase', { interfaces: ['IB', 'IC'] }),
      [`${SYNTHETIC_ASSEMBLY}.DiamondDerived`]: classType('DiamondDerived', {
        base: 'DiamondBase',
        interfaces: ['IB'],
      }),
    },
  };

  return typeSystem.addAssembly(new reflect.Assembly(typeSystem, assemblySpec));
}

function interfaceType(name: string, bases: string[] = []): spec.InterfaceType {
  return {
    kind: spec.TypeKind.Interface,
    assembly: SYNTHETIC_ASSEMBLY,
    fqn: `${SYNTHETIC_ASSEMBLY}.${name}`,
    name,
    ...(bases.length > 0 ? { interfaces: bases.map((base) => `${SYNTHETIC_ASSEMBLY}.${base}`) } : {}),
  };
}

function classType(name: string, opts: { base?: string; interfaces?: string[] } = {}): spec.ClassType {
  return {
    kind: spec.TypeKind.Class,
    assembly: SYNTHETIC_ASSEMBLY,
    fqn: `${SYNTHETIC_ASSEMBLY}.${name}`,
    name,
    ...(opts.base ? { base: `${SYNTHETIC_ASSEMBLY}.${opts.base}` } : {}),
    ...(opts.interfaces && opts.interfaces.length > 0
      ? { interfaces: opts.interfaces.map((iface) => `${SYNTHETIC_ASSEMBLY}.${iface}`) }
      : {}),
  };
}
