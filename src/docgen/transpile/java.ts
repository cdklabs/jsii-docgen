import * as reflect from 'jsii-reflect';
import * as transpile from './transpile';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Case = require('case');

// Helper methods
const toCamelCase = (text?: string) => {
  return Case.camel(text ?? '');
};

// convenience method to work around https://github.com/microsoft/TypeScript/issues/16069
const isNotNull = <T>(value: T): value is NonNullable<T> => {
  return value != null;
};

// [1, 2, 3] -> [[], [1], [1, 2], [1, 2, 3]]
const prefixArrays = <T>(arr: T[]): T[][] => {
  const out: T[][] = [[]];
  const prefix: T[] = [];
  for (const elem of arr) {
    prefix.push(elem);
    out.push([...prefix]);
  }
  return out;
};

export class JavaTranspile extends transpile.TranspileBase {
  constructor() {
    super(transpile.Language.JAVA);
  }

  public moduleLike(
    moduleLike: reflect.ModuleLike,
  ): transpile.TranspiledModuleLike {
    const fqn: string = moduleLike.targets?.java?.package;
    if (!fqn) {
      throw new Error(
        `Java is not a supported target for module: ${moduleLike.fqn}`,
      );
    }

    if (moduleLike instanceof reflect.Submodule) {
      const fqnParts = fqn.split('.');
      fqnParts.pop();
      return { name: fqnParts.join('.'), submodule: fqn };
    }

    return { name: fqn };
  }

  public callable(callable: reflect.Callable): transpile.TranspiledCallable {
    const type = this.type(callable.parentType);

    const parameters = callable.parameters.sort(this.optionalityCompare);
    const requiredParams = parameters.filter((p) => !p.optional);
    const optionalParams = parameters.filter((p) => p.optional);

    const name = callable.name;
    const inputLists = prefixArrays(optionalParams).map((optionals) => {
      return [...requiredParams, ...optionals].map((p) => this.formatParameters(this.parameter(p)));
    });

    const signatures = inputLists.map((inputs) => {
      return this.formatSignature(name, inputs);
    });

    const invocations = inputLists.map((inputs) => {
      return callable.kind === reflect.MemberKind.Initializer
        ? this.formatClassInitialization(type, inputs)
        : this.formatInvocation(type, inputs, name);
    });

    return {
      name,
      parentType: type,
      import: this.formatImport(type),
      parameters,
      signatures,
      invocations,
    };
  }

  public class(klass: reflect.ClassType): transpile.TranspiledClass {
    return {
      name: klass.name,
      type: this.type(klass),
    };
  }

  public struct(struct: reflect.InterfaceType): transpile.TranspiledStruct {
    const type = this.type(struct);
    const inputs = struct.allProperties.map((p) =>
      this.formatBuilderMethod(this.property(p)),
    ).filter(isNotNull);
    return {
      type: type,
      name: struct.name,
      import: this.formatImport(type),
      initialization: this.formatStructInitialization(type, inputs),
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

  public property(property: reflect.Property): transpile.TranspiledProperty {
    return {
      name: property.name,
      parentType: this.type(property.parentType),
      typeReference: this.typeReference(property.type),
      optional: property.optional,
    };
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

  public unionOf(_types: string[]): string {
    return 'java.lang.Object';
  }

  public listOf(type: string): string {
    return `java.util.List<${type}>`;
  }

  public mapOf(type: string): string {
    return `java.util.Map<java.lang.String, ${type}>`;
  }

  public any(): string {
    return 'java.lang.Object';
  }

  public str(): string {
    return 'java.lang.String';
  }

  public number(): string {
    return 'java.lang.Number';
  }

  public boolean(): string {
    return 'java.lang.Boolean';
  }

  public json(): string {
    return 'com.fasterxml.jackson.databind.node.ObjectNode';
  }

  public date(): string {
    return 'java.time.Instant';
  }

  public readme(readme: string): string {
    return readme;
  }

  private formatImport(type: transpile.TranspiledType): string {
    return `import ${type.fqn};`;
  };

  private formatParameters(
    transpiled: transpile.TranspiledParameter | transpile.TranspiledProperty,
  ): string {
    const tf = transpiled.typeReference.toString({
      typeFormatter: (t) => t.name,
    });
    return `${transpiled.name}: ${tf}`;
  }

  private formatArguments(inputs: string[]): string {
    return inputs.join(', ');
  };

  private formatStructInitialization(type: transpile.TranspiledType, inputs: string[]): string {
    const builder = `${type.name} ${toCamelCase(type.name)} = new ${type.name}.Builder()`;
    return [
      builder,
      ...inputs,
      '  .build();',
    ].join('\n');
  };

  private formatClassInitialization(
    type: transpile.TranspiledType,
    inputs: string[],
  ): string {
    return `new ${type.name}(${this.formatArguments(inputs)})`;
  };

  private formatSignature(name: string, inputs: string[]) {
    return `public ${name}(${this.formatArguments(inputs)})`;
  };

  private formatBuilderMethod(
    transpiled: transpile.TranspiledParameter,
  ): string | undefined {
    const tf = transpiled.typeReference.toString({
      typeFormatter: (t) => t.name,
    });
    const lowerCamel = toCamelCase(transpiled.name);
    return `  .${lowerCamel}(${lowerCamel}: ${tf})${transpiled.optional ? ' // optional' : ''}`;
  }

  private formatInvocation(
    type: transpile.TranspiledType,
    inputs: string[],
    method: string,
  ): string {
    let target = type.submodule ? `${type.namespace}.${type.name}` : type.name;
    if (method) {
      target = `${target}.${method}`;
    }
    return `${target}(${this.formatArguments(inputs)})`;
  };

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
}