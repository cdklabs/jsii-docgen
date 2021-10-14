import * as Case from 'case';
import * as reflect from 'jsii-reflect';
import * as transpile from './transpile';

export class CSharpTranspile extends transpile.TranspileBase {
  constructor() {
    super(transpile.Language.CSHARP);
  }

  public moduleLike(
    moduleLike: reflect.ModuleLike,
  ): transpile.TranspiledModuleLike {
    const csharpPackage: string = moduleLike.targets?.dotnet?.namespace;

    // if this is a submodule, we need to break the package name down into the
    // parent name and the submodule. we also allow submodules not to have
    // explicit target names, in which case we need to append the pascal-cased
    // submodule name to the parent package name.
    if (moduleLike instanceof reflect.Submodule) {
      const parent = this.getParentModule(moduleLike);
      const parentFqn = parent.targets?.dotnet?.namespace;

      // if the submodule does not explicitly define a dotnet package name, we need to deduce it from the parent
      const submoduleCSharpPackage = csharpPackage ?? `${parentFqn}.${Case.pascal(moduleLike.name)}`;
      return { name: parentFqn, submodule: submoduleCSharpPackage };
    }

    return { name: csharpPackage };
  }

  public type(type: reflect.Type): transpile.TranspiledType {
    const submodule = this.findSubmodule(type);
    const moduleLike = this.moduleLike(submodule ? submodule : type.assembly);

    const fqn = [];

    let namespace = type.namespace;
    if (namespace) {
      fqn.push(moduleLike.name);
      fqn.push(namespace);
    } else {
      fqn.push(moduleLike.name);
    }
    fqn.push(type.name);

    return {
      fqn: fqn.join('.'),
      name: type.name,
      namespace: namespace,
      module: moduleLike.name,
      submodule: moduleLike.submodule,
      source: type,
      language: this.language,
    };
  }

  public callable(callable: reflect.Callable): transpile.TranspiledCallable {
    const type = this.type(callable.parentType);
    const isInitializer = callable.kind === reflect.MemberKind.Initializer;
    const name = isInitializer
      ? type.name
      : Case.pascal(callable.name);

    const params = callable.parameters.map(p => this.formatParameter(this.parameter(p))).join(', ');
    const signatures = [`public ${name}(${params})`];
    const invocations = [isInitializer
      ? `new ${name}(${params});`
      : `${type.name}.${name}(${params});`];

    return {
      name,
      parentType: type,
      import: this.formatImport(type),
      parameters: callable.parameters,
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

  public unionOf(): string {
    return 'object';
  }

  public listOf(type: string): string {
    return `${type}[]`;
  }

  public mapOf(type: string): string {
    return `System.Collections.Generic.IDictionary<string, ${type}>`;
  }

  public any(): string {
    return 'object';
  }

  public str(): string {
    return 'string';
  }

  public number(): string {
    return 'double';
  }

  public boolean(): string {
    return 'bool';
  }

  public json(): string {
    return 'Newtonsoft.Json.Linq.JObject';
  }

  public date(): string {
    return 'System.DateTime';
  }

  public readme(readme: string): string {
    return readme;
  }

  private formatImport(type: transpile.TranspiledType): string {
    return `using ${type.module};`;
  };

  private formatParameter(
    transpiled: transpile.TranspiledParameter | transpile.TranspiledProperty,
  ): string {
    const tf = transpiled.typeReference.toString({
      typeFormatter: (t) => t.name,
    });
    return `${tf} ${transpiled.name}`;
  }

  private formatStructBuilder(type: transpile.TranspiledType, properties: string[]): string {
    const builder = `new ${type.name} {`;
    return [
      builder,
      ...properties,
      '};',
    ].join('\n');
  };

  private formatBuilderMethod(
    transpiled: transpile.TranspiledParameter,
    indent: string,
  ): string[] {
    return [`${indent}${transpiled.name}`];
  }

  private formatProperty(
    name: string,
    typeReference: transpile.TranspiledTypeReference,
  ): string {
    const tf = typeReference.toString({
      typeFormatter: (t) => t.name,
    });
    return `${tf} ${name}`;
  }
}
