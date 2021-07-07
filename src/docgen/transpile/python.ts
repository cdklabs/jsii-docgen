import * as reflect from 'jsii-reflect';
import * as transpile from './transpile';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Case = require('case');

// Helpers
const toSnakeCase = (text?: string) => {
  return Case.snake(text ?? '');
};

const formatImport = (type: transpile.TranspiledType) => {
  if (type.submodule) {
    return `from ${type.module} import ${type.submodule}`;
  }
  return `import ${type.module}`;
};

const formatInputs = (inputs: string[], indent: number) => {
  return inputs.join(`, \n${' '.repeat(indent)}`);
};

const formatInvocation = (
  type: transpile.TranspiledType,
  inputs: string[],
  method?: string,
) => {
  let target;
  if (type.submodule) {
    if (!type.namespace) {
      throw new Error(
        `Invalid type: ${type.fqn}: Types defined in a submodule (${type.submodule}) must have a namespace. `,
      );
    }
    // we don't include the submodule name here since it is
    // included in the namespace. this works because we import the submodule
    // in this case.
    // TODO - merge `formatInvocation` with `formatImport` since they are inherently coupled.
    target = `${type.namespace}.${type.name}`;
  } else {
    target = type.fqn;
  }

  if (method) {
    target = `${target}.${method}`;
  }
  return `${target}(${formatInputs(inputs, 1 + target.length)})`;
};

const formatSignature = (name: string, inputs: string[]) => {
  const def = 'def ';
  // length of the word 'def' +
  // length of the method name +
  // 1 opening paranthesis
  const indent = def.length + name.length + 1;
  return `${def}${name}(${formatInputs(inputs, indent)})`;
};

/**
 * Hack to convert a jsii property to a parameter for
 * python specific parameter expansion.
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

/**
 * A python transpiler.
 */
export class PythonTranspile extends transpile.TranspileBase {
  constructor() {
    super(transpile.Language.PYTHON);
  }

  public readme(readme: string): string {
    return readme;
  }

  public unionOf(types: string[]): string {
    return `${this.typing('Union')}[${types.join(', ')}]`;
  }

  public listOf(type: string): string {
    return `${this.typing('List')}[${type}]`;
  }

  public mapOf(type: string): string {
    return `${this.typing('Mapping')}[${type}]`;
  }

  public any(): string {
    return this.typing('Any');
  }

  public boolean(): string {
    return 'bool';
  }

  public str(): string {
    return 'str';
  }

  public number(): string {
    return `${this.typing('Union')}[int, float]`;
  }

  public date(): string {
    return 'datetime.datetime';
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
  public json(): string {
    return 'any';
  }

  public property(property: reflect.Property): transpile.TranspiledProperty {
    return {
      name: property.const ? property.name : toSnakeCase(property.name),
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
      name: toSnakeCase(parameter.name),
      parentType: this.type(parameter.parentType),
      typeReference: this.typeReference(parameter.type),
      optional: parameter.optional,
    };
  }

  public struct(struct: reflect.InterfaceType): transpile.TranspiledStruct {
    const type = this.type(struct);
    const inputs = struct.allProperties.map((p) =>
      this.formatInput(this.property(p)),
    );
    return {
      type: type,
      name: struct.name,
      import: formatImport(type),
      initialization: formatInvocation(type, inputs),
    };
  }

  public callable(callable: reflect.Callable): transpile.TranspiledCallable {
    const type = this.type(callable.parentType);

    const parameters = new Array<reflect.Parameter>();

    for (const p of callable.parameters.sort(this.optionalityCompare)) {
      if (!this.isStruct(p)) {
        parameters.push(p);
      } else {
        // struct parameters are expanded to the individual struct properties
        const struct = p.parentType.system.findInterface(p.type.fqn!);
        for (const property of struct.allProperties) {
          const parameter = propertyToParameter(callable, property);
          parameters.push(parameter);
        }
      }
    }

    const name = toSnakeCase(callable.name);
    const inputs = parameters.map((p) => this.formatInput(this.parameter(p)));

    return {
      name,
      parentType: type,
      import: formatImport(type),
      parameters,
      signature: formatSignature(name, inputs),
      invocation: formatInvocation(
        type,
        inputs,
        callable.kind === reflect.MemberKind.Initializer ? undefined : name,
      ),
    };
  }

  public moduleLike(
    moduleLike: reflect.ModuleLike,
  ): transpile.TranspiledModuleLike {
    const fqn = moduleLike.targets?.python?.module;
    if (!fqn) {
      throw new Error(
        `Python is not a supported target for module: ${moduleLike.fqn}`,
      );
    }

    if (moduleLike instanceof reflect.Submodule) {
      const fqnParts = fqn.split('.');
      return { name: fqnParts[0], submodule: fqnParts[1] };
    }
    return { name: fqn };
  }

  public interface(
    iface: reflect.InterfaceType,
  ): transpile.TranspiledInterface {
    return {
      name: iface.name,
      type: this.type(iface),
    };
  }

  private optionalityCompare(
    p1: reflect.Parameter,
    p2: reflect.Parameter,
  ): number {
    if (!p1.optional && p1.optional) {
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

  private typing(type: 'List' | 'Mapping' | 'Any' | 'Union'): string {
    return `typing.${type}`;
  }

  private formatInput(
    transpiled: transpile.TranspiledParameter | transpile.TranspiledProperty,
  ): string {
    const tf = transpiled.typeReference.toString({
      typeFormatter: (t) => t.name,
    });
    return `${transpiled.name}: ${tf}${transpiled.optional ? ' = None' : ''}`;
  }
}
