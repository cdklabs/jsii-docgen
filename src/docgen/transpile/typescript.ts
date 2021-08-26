import * as reflect from 'jsii-reflect';
import * as transpile from './transpile';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Case = require('case');

// Helpers
const toCamelCase = (text?: string) => {
  return Case.camel(text ?? '');
};

const formatArguments = (inputs: string[]) => {
  return inputs.join(', ');
};

const formatStructInitialization = (type: transpile.TranspiledType) => {
  const target = type.submodule ? `${type.namespace}.${type.name}` : type.name;
  return `const ${toCamelCase(type.name)}: ${target} = { ... }`;
};

const formatClassInitialization = (
  type: transpile.TranspiledType,
  inputs: string[],
) => {
  const target = type.submodule ? `${type.namespace}.${type.name}` : type.name;
  return `new ${target}(${formatArguments(inputs)})`;
};

const formatInvocation = (
  type: transpile.TranspiledType,
  inputs: string[],
  method: string,
) => {
  let target = type.submodule ? `${type.namespace}.${type.name}` : type.name;
  if (method) {
    target = `${target}.${method}`;
  }
  return `${target}(${formatArguments(inputs)})`;
};

const formatImport = (type: transpile.TranspiledType) => {
  if (type.submodule) {
    return `import { ${type.submodule} } from '${type.module}'`;
  } else {
    return `import { ${type.name} } from '${type.module}'`;
  }
};

const formatSignature = (name: string, inputs: string[]) => {
  return `public ${name}(${formatArguments(inputs)})`;
};

/**
 * A TypeScript transpiler.
 */
export class TypeScriptTranspile extends transpile.TranspileBase {
  constructor() {
    super(transpile.Language.TYPESCRIPT);
  }

  public readme(readme: string): string {
    return readme;
  }

  public unionOf(types: string[]): string {
    return `${types.join(' | ')}`;
  }

  public listOf(type: string): string {
    return `${type}[]`;
  }

  public mapOf(type: string): string {
    return `{[ key: string ]: ${type}}`;
  }

  public any(): string {
    return 'any';
  }

  public boolean(): string {
    return 'boolean';
  }

  public str(): string {
    return 'string';
  }

  public number(): string {
    return 'number';
  }

  public date(): string {
    return 'Date';
  }

  public json(): string {
    return 'object';
  }

  public enum(enu: reflect.EnumType): transpile.TranspiledEnum {
    return {
      fqn: this.type(enu).fqn,
      name: enu.name,
    };
  }

  public enumMember(em: reflect.EnumMember): transpile.TranspiledEnumMember {
    return {
      fqn: `${this.enum(em.enumType).fqn}.${em.name}`,
      name: em.name,
    };
  }

  public property(property: reflect.Property): transpile.TranspiledProperty {
    return {
      name: property.name,
      parentType: this.type(property.parentType),
      typeReference: this.typeReference(property.type),
      optional: property.optional,
    };
  }

  public class(klass: reflect.ClassType): transpile.TranspiledClass {
    return {
      name: klass.name,
      type: this.type(klass),
    };
  }

  public parameter(
    parameter: reflect.Parameter,
  ): transpile.TranspiledParameter {
    return {
      name: parameter.name,
      parentType: this.type(parameter.parentType),
      typeReference: this.typeReference(parameter.type),
      optional: parameter.optional,
    };
  }

  public struct(struct: reflect.InterfaceType): transpile.TranspiledStruct {
    const type = this.type(struct);
    return {
      type: type,
      name: struct.name,
      import: formatImport(type),
      initialization: formatStructInitialization(type),
    };
  }

  public callable(callable: reflect.Callable): transpile.TranspiledCallable {
    const type = this.type(callable.parentType);
    const parameters = callable.parameters.sort(this.optionalityCompare);
    const name = callable.name;
    const inputs = parameters.map((p) => this.formatParameters(this.parameter(p)));

    const invocation =
      callable.kind === reflect.MemberKind.Initializer
        ? formatClassInitialization(type, inputs)
        : formatInvocation(type, inputs, name);

    return {
      name,
      parentType: type,
      import: formatImport(type),
      parameters,
      signatures: [formatSignature(name, inputs)],
      invocations: [invocation],
    };
  }

  public interface(
    iface: reflect.InterfaceType,
  ): transpile.TranspiledInterface {
    return {
      name: iface.name,
      type: this.type(iface),
    };
  }

  public moduleLike(
    moduleLike: reflect.ModuleLike,
  ): transpile.TranspiledModuleLike {
    if (moduleLike instanceof reflect.Submodule) {
      const fqnParts = moduleLike.fqn.split('.');
      return { name: fqnParts[0], submodule: fqnParts[1] };
    }
    return { name: moduleLike.fqn };
  }

  private optionalityCompare(
    p1: reflect.Parameter,
    p2: reflect.Parameter,
  ): number {
    if (!p1.optional && p2.optional) {
      return -1;
    }
    if (!p2.optional && p1.optional) {
      return 1;
    }
    return 0;
  }

  private formatParameters(
    transpiled: transpile.TranspiledParameter | transpile.TranspiledProperty,
  ): string {
    const tf = transpiled.typeReference.toString({
      typeFormatter: (t) => t.name,
    });
    return `${transpiled.name}${transpiled.optional ? '?' : ''}: ${tf}`;
  }
}
