import * as reflect from 'jsii-reflect';
import * as transpile from './transpile';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Case = require('case');

// Helper methods
const toCamelCase = (text?: string) => {
  return Case.camel(text ?? '');
};

const toUpperCamelCase = (test?: string) => {
  const camelCase = toCamelCase(test);
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
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

/**
 * Hack to convert a jsii property to a parameter for
 * parameter expansion.
 */
const propertyToParameter = (
  callable: reflect.Callable,
  property: reflect.Property,
): reflect.Parameter => {
  return {
    docs: property.docs,
    method: callable,
    name: property.name,
    optional: property.optional,
    parentType: property.parentType,
    spec: property.spec,
    system: property.system,
    type: property.type,
    variadic: false,
  };
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
      const parent = this.getParentModule(moduleLike);
      if (!parent) {
        throw new Error(`Could not find parent module of ${moduleLike.fqn}`);
      }
      const parentFqn = parent.targets?.java?.package;
      if (!fqn.startsWith(parentFqn)) {
        throw new Error(`Expected submodule ${fqn} to start with ${parentFqn} since it is its parent module.`);
      }
      // { name: "software.amazon.awscdk", submodule: "services.ecr" }
      return { name: parentFqn, submodule: fqn.substring(parentFqn.length + 1) };
    }

    return { name: fqn };
  }

  private getParentModule(moduleLike: reflect.ModuleLike): reflect.Assembly | undefined {
    const ts = moduleLike.system;
    for (const assembly of ts.assemblies) {
      const child = assembly.submodules.find((mod) => mod.fqn === moduleLike.fqn);
      if (child) {
        return assembly;
      }
    }
    return undefined;
  }

  public callable(callable: reflect.Callable): transpile.TranspiledCallable {
    const type = this.type(callable.parentType);

    const parameters = callable.parameters.sort(this.optionalityCompare);

    const requiredParams = parameters.filter((p) => !p.optional);
    const optionalParams = parameters.filter((p) => p.optional);

    const name = callable.name;

    // simulate Java method overloading
    const inputLists = prefixArrays(optionalParams).map((optionals) => {
      return [...requiredParams, ...optionals].map((p) => this.formatParameter(this.parameter(p)));
    });

    const signatures = inputLists.map((inputs) => {
      return this.formatSignature(name, inputs);
    });

    let invocations;

    if (this.isClassBuilderGenerated(callable)) {
      const struct = this.extractFirstStruct(parameters);

      // render using Java builder syntax (show no overloads)
      invocations = [this.formatClassBuilder(type, parameters, struct)];

      // flatten out the parameters so the user doesn't have to jump between
      // docs of Foo and FooProps
      for (const property of struct.allProperties) {
        const parameter = propertyToParameter(callable, property);
        parameters.push(parameter);
      }
    } else {
      invocations = callable.kind === reflect.MemberKind.Initializer
        // render with `new Class` syntax (showing all constructor overloads)
        ? inputLists.map((inputs) => this.formatClassInitialization(type, inputs))
        // render invocation as method calls (showing all method overloads)
        : inputLists.map((inputs) => this.formatInvocation(type, inputs, name));
    }

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
    const indent = ' '.repeat(4);
    const inputs = struct.allProperties.map((p) =>
      this.formatBuilderMethod(this.property(p), indent),
    ).flat();
    return {
      type: type,
      name: struct.name,
      import: this.formatImport(type),
      initialization: this.formatStructBuilder(type, inputs),
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
    const typeRef = this.typeReference(parameter.type);
    return {
      name: parameter.name,
      parentType: this.type(parameter.parentType),
      typeReference: typeRef,
      optional: parameter.optional,
      declaration: this.formatProperty(parameter.name, typeRef),
    };
  }

  public property(property: reflect.Property): transpile.TranspiledProperty {
    const typeRef = this.typeReference(property.type);
    return {
      name: property.name,
      parentType: this.type(property.parentType),
      typeReference: typeRef,
      optional: property.optional,
      declaration: this.formatProperty(property.name, typeRef),
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

  public unionOf(types: string[]): string {
    return types.join(' OR ');
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

  private formatParameter(
    transpiled: transpile.TranspiledParameter | transpile.TranspiledProperty,
  ): string {
    const tf = transpiled.typeReference.toString({
      typeFormatter: (t) => t.name,
    });
    return `${tf} ${transpiled.name}`;
  }

  private formatInputs(inputs: string[]): string {
    return inputs.join(', ');
  };

  private formatStructBuilder(type: transpile.TranspiledType, methods: string[]): string {
    const builder = `${type.name}.builder()`;
    return [
      builder,
      ...methods,
      '    .build();',
    ].join('\n');
  };

  private formatClassInitialization(
    type: transpile.TranspiledType,
    inputs: string[],
  ): string {
    return `new ${type.name}(${this.formatInputs(inputs)});`;
  };

  private formatClassBuilder(
    type: transpile.TranspiledType,
    parameters: reflect.Parameter[],
    struct: reflect.InterfaceType,
  ): string {
    const createArgs = this.formatInputs(parameters.map((p) => this.formatParameter(this.parameter(p))));
    const indent = ' '.repeat(4);
    const methods: string[] = struct.allProperties.map((p) =>
      this.formatBuilderMethod(this.property(p), indent),
    ).flat();
    return [
      `${type.name}.Builder.create(${createArgs})`,
      ...methods,
      `${indent}.build();`,
    ].join('\n');
  };


  private formatSignature(name: string, inputs: string[]) {
    return `public ${name}(${this.formatInputs(inputs)})`;
  };

  private formatBuilderMethod(
    transpiled: transpile.TranspiledParameter,
    indent: string,
  ): string[] {
    if (transpiled.optional) indent = '//' + indent.slice(2);
    const lowerCamel = toCamelCase(transpiled.name);
    const base = `${indent}.${lowerCamel}`;
    const tf = transpiled.typeReference.toString({
      typeFormatter: (t) => t.name,
    });
    // allow rendering union types as multiple overrided builder methods
    if (tf.includes(' OR ')) {
      const choices = tf.split(' OR ');
      return choices.map((typ) => `${base}(${typ})`);
    } else {
      return [`${base}(${tf})`];
    }
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
    return `${target}(${this.formatInputs(inputs)})`;
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

  private isStruct(p: reflect.Parameter): boolean {
    return p.type.fqn ? p.system.findFqn(p.type.fqn).isDataType() : false;
  }

  private isClassBuilderGenerated(
    callable: reflect.Callable,
  ): boolean {
    if (callable.kind !== reflect.MemberKind.Initializer) {
      return false;
    }

    const parameters: reflect.Parameter[] = callable.parameters.sort(this.optionalityCompare);
    const firstStruct = parameters.find((param) => this.isStruct(param));

    // no builder is generated if there is no struct parameter
    if (!firstStruct) {
      return false;
    }

    return true;
  };

  /**
   * Extracts the first struct out of a list of parameters (and throws
   * if there is none), removing it from the array.
   */
  private extractFirstStruct(
    parameters: reflect.Parameter[],
  ): reflect.InterfaceType {
    const firstStruct = parameters.find((param) => this.isStruct(param));
    if (!firstStruct) {
      throw new Error('No struct found in parameter list.');
    }
    const struct = firstStruct.parentType.system.findInterface(firstStruct.type.fqn!);
    parameters.splice(parameters.indexOf(firstStruct), 1);
    return struct;
  }

  private formatProperty(
    name: string,
    typeReference: transpile.TranspiledTypeReference,
  ): string {
    const tf = typeReference.toString({
      typeFormatter: (t) => t.name,
    });
    if (tf.includes(' OR ')) {
      return `public java.lang.Object get${toUpperCamelCase(name)}();`;
    } else {
      return `public ${tf} get${toUpperCamelCase(name)}();`;
    }
  }
}
