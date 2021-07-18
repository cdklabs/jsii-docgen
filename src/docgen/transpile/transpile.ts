import * as reflect from 'jsii-reflect';
import { TypeJson } from '../schema';

/**
 * Supported languages to generate documentation in.
 */
export class Language {
  /**
   * TypeScript.
   */
  public static readonly TYPESCRIPT = new Language('typescript');

  /**
   * Python.
   */
  public static readonly PYTHON = new Language('python');

  /**
   * Transform a literal string to the `Language` object.
   *
   * Throws an `UnsupportedLanguageError` if the language is not supported.
   */
  public static fromString(lang: string) {
    switch (lang) {
      case Language.TYPESCRIPT.toString():
        return Language.TYPESCRIPT;
      case Language.PYTHON.toString():
        return Language.PYTHON;
      default:
        throw new UnsupportedLanguageError(lang, [Language.TYPESCRIPT, Language.PYTHON]);
    }
  }

  private constructor(private readonly lang: string) {}

  public toString() {
    return this.lang;
  }
}

export class UnsupportedLanguageError extends Error {
  constructor(lang: string, supported: Language[]) {
    super(`Unsupported language: ${lang}. Supported languages are: [${supported}]`);
  }
}

/**
 * Outcome of transpiling a jsii struct.
 */
export interface TranspiledStruct {
  /**
   * The (transpiled) type.
   */
  readonly type: TranspiledType;
  /**
   * The name.
   */
  readonly name: string;
  /**
   * The import statement needed in order to use this struct.
   */
  readonly import: string;
  /**
   * How to initialize this struct.
   */
  readonly initialization: string;
}

/**
 * Outcome of transpiling a jsii class.
 */
export interface TranspiledClass {
  /**
   * The (transpiled) type.
   */
  readonly type: TranspiledType;
  /**
   * The name.
   */
  readonly name: string;
}

/**
 * Outcome of transpiling a jsii callable.
 */
export interface TranspiledCallable {
  /**
   * The (transpiled) parent type.
   */
  readonly parentType: TranspiledType;
  /**
   * How a signature of the callable looks like.
   */
  readonly signature: string;
  /**
   * The name.
   */
  readonly name: string;
  /**
   * The import statement needed in order to use this callable.
   */
  readonly import: string;
  /**
   * How an invocation of this callable looks like.
   */
  readonly invocation: string;
  /**
   * The jsii parameters this callable accepts.
   */
  readonly parameters: reflect.Parameter[];
}

/**
 * Outcome of transpiling a jsii parameter.
 */
export interface TranspiledParameter {
  /**
   * The name.
   */
  readonly name: string;
  /**
   * The (transpiled) parent type.
   */
  readonly parentType: TranspiledType;
  /**
   * The (transpiled) type reference.
   */
  readonly typeReference: TranspiledTypeReference;
  /**
   * Whether or not the parameter is optional.
   */
  readonly optional: boolean;
}

/**
 * Outcome of transpiling a jsii interface (not data type).
 */
export interface TranspiledInterface {
  /**
   * The (transpiled) type.
   */
  readonly type: TranspiledType;
  /**
   * The name.
   */
  readonly name: string;
}

/**
 * Outcome of transpiling a generic jsii type.
 */
export interface TranspiledType {

  /**
   * The source type this was transliterated from.
   */
  readonly source: reflect.Type;

  /**
   * The transliteration language.
   */
  readonly language: Language;

  /**
   * The language specific fqn.
   */
  readonly fqn: string;
  /**
   * Simple name of the type.
   */
  readonly name: string;
  /**
   * Namespace of the type.
   */
  readonly namespace?: string;
  /**
   * The language specific module name the type belongs to.
   */
  readonly module: string;
  /**
   * The language specific submodule name the type belongs to.
   */
  readonly submodule?: string;
}

/**
 * Options for how to render a string representation of a type reference.
 */
export interface TranspiledTypeReferenceToStringOptions {
  /**
   * Type formatter.
   */
  typeFormatter?: (type: TranspiledType) => string;
  /**
   * String formatter.
   */
  stringFormatter?: (typeName: string) => string;
}

/**
 * Outcome of transpiling a jsii type reference.
 */
export class TranspiledTypeReference {
  /**
   * Create a type reference that reprensents a primitive.
   */
  public static primitive(
    transpile: Transpile,
    ref: reflect.TypeReference,
    primitive: string,
  ): TranspiledTypeReference {
    return new TranspiledTypeReference(transpile, ref, primitive);
  }
  /**
   * Create a type reference that represents any type.
   */
  public static any(
    transpile: Transpile,
    ref: reflect.TypeReference,
  ): TranspiledTypeReference {
    return new TranspiledTypeReference(transpile, ref, undefined, true);
  }
  /**
   * Create a type reference that reprenets a concrete type.
   */
  public static type(
    transpile: Transpile,
    ref: reflect.TypeReference,
    type: TranspiledType,
  ): TranspiledTypeReference {
    return new TranspiledTypeReference(
      transpile,
      ref,
      undefined,
      undefined,
      type,
    );
  }
  /**
   * Create a type reference that reprenets an array of a type reference.
   */
  public static arrayOfType(
    transpile: Transpile,
    ref: reflect.TypeReference,
    tf: TranspiledTypeReference,
  ): TranspiledTypeReference {
    return new TranspiledTypeReference(
      transpile,
      ref,
      undefined,
      undefined,
      undefined,
      tf,
    );
  }
  /**
   * Create a type reference that reprenets a map of a type reference.
   */
  public static mapOfType(
    transpile: Transpile,
    ref: reflect.TypeReference,
    tf: TranspiledTypeReference,
  ): TranspiledTypeReference {
    return new TranspiledTypeReference(
      transpile,
      ref,
      undefined,
      undefined,
      undefined,
      undefined,
      tf,
    );
  }
  /**
   * Create a type reference that reprenets a union of a type references.
   */
  public static unionOfTypes(
    transpile: Transpile,
    ref: reflect.TypeReference,
    tfs: TranspiledTypeReference[],
  ): TranspiledTypeReference {
    return new TranspiledTypeReference(
      transpile,
      ref,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      tfs,
    );
  }

  private constructor(
    /**
     * A transpiler
     */
    private readonly transpile: Transpile,
    /**
     * The original type reference.
     */
    private readonly ref: reflect.TypeReference,
    /**
     * Primitive type ref.
     */
    private readonly primitive?: string,
    /**
     * 'Any' type ref
     */
    private readonly isAny?: boolean,
    /**
     * Concrete type.
     */
    private readonly type?: TranspiledType,
    /**
     * Array of ref.
     */
    private readonly arrayOfType?: TranspiledTypeReference,
    /**
     * Map of ref.
     */
    private readonly mapOfType?: TranspiledTypeReference,
    /**
     * Union of ref.
     */
    private readonly unionOfTypes?: TranspiledTypeReference[],
  ) {}

  public toString(options?: TranspiledTypeReferenceToStringOptions): string {
    const tFormatter = options?.typeFormatter ?? ((t) => t.fqn);
    const sFormatter = options?.stringFormatter ?? ((s) => s);
    if (this.primitive) {
      return sFormatter(this.primitive);
    }
    if (this.type) {
      return tFormatter(this.type);
    }
    if (this.isAny) {
      return sFormatter(this.transpile.any());
    }
    if (this.arrayOfType) {
      const ref = this.arrayOfType.toString(options);
      return this.transpile.listOf(ref);
    }
    if (this.mapOfType) {
      const ref = this.mapOfType.toString(options);
      return this.transpile.mapOf(ref);
    }
    if (this.unionOfTypes) {
      const refs = this.unionOfTypes.map((t) => t.toString(options));
      return this.transpile.unionOf(refs);
    }
    throw new Error(`Invalid type reference: ${this.ref.toString()}`);
  }

  public toJson(): TypeJson {
    if (this.primitive) {
      return {
        name: this.primitive,
      };
    }

    if (this.type) {
      return {
        fqn: this.ref.fqn,
        name: this.type.fqn,
      };
    }

    if (this.isAny) {
      return {
        name: this.transpile.any(),
      };
    }

    if (this.arrayOfType) {
      return {
        name: this.transpile.listOf('%'),
        types: [this.arrayOfType.toJson()],
      };
    }
    if (this.mapOfType) {
      return {
        name: this.transpile.mapOf('%'),
        types: [this.mapOfType.toJson()],
      };
    }
    if (this.unionOfTypes) {
      const inner = [...Array(this.unionOfTypes.length)].map(() => '%');
      return {
        name: this.transpile.unionOf(inner),
        types: this.unionOfTypes.map((t) => t.toJson()),
      };
    }

    throw new Error(`Invalid type reference: ${this.ref.toString()}`);
  }
}

/**
 * Outcome of transpiling a jsii property.
 */
export type TranspiledProperty = TranspiledParameter;

/**
 * Outcome of transpiling a jsii enum.
 */
export interface TranspiledEnum {
  /**
   * The language specific fqn.
   */
  readonly fqn: string;
  /**
   * The name.
   */
  readonly name: string;
}

/**
 * Outcome of transpiling a specific enum member.
 */
export interface TranspiledEnumMember {
  /**
   * The language specific fqn.
   */
  readonly fqn: string;
  /**
   * The name.
   */
  readonly name: string;
}

/**
 * Outcome of transpiling a module like object. (Assembly | Submodule)
 */
export interface TranspiledModuleLike {
  /**
   * The language specific module name.
   *
   * In case the module like object is a submodule, this should contain
   * only the root module name.
   *
   * In case the module like object is the root module, this should contain
   * the module fqn.
   *
   * Examples:
   *
   *   `aws-cdk-lib` -> `aws_cdk`
   *   `aws-cdk-lib.aws_eks` -> `aws_cdk`
   *   `@aws-cdk/aws-eks` -> `aws_cdk.aws_eks`
   */
  readonly name: string;
  /**
   * The language specific submodule name.
   *
   * In case the module like object is a submodule, this should contain
   * only the submodule name.
   *
   * In case the module like object is the root module, this should be undefined
   *
   * Examples:
   *
   *   `aws-cdk-lib` -> undefined
   *   `aws-cdk-lib.aws_eks` -> `aws_eks`
   *   `@aws-cdk/aws-eks` -> undefined
   */
  readonly submodule?: string;
}

/**
 * Language transpiling for jsii types.
 */
export interface Transpile {
  /**
   * The language of the transpiler.
   */
  readonly language: Language;

  /**
   * How links to types should be formatted.
   *
   * @default '#{fqn}'
   */
  readonly linkFormatter?: (type: TranspiledType) => string;

  /**
   * Transpile a module like object (Assembly | Submodule)
   */
  moduleLike(moduleLike: reflect.ModuleLike): TranspiledModuleLike;

  /**
   * Transpile a callable (method, static function, initializer)
   */
  callable(callable: reflect.Callable): TranspiledCallable;

  /**
   * Transpile a class.
   */
  class(klass: reflect.ClassType): TranspiledClass;

  /**
   * Transpile a struct (data type interface).
   */
  struct(struct: reflect.InterfaceType): TranspiledStruct;

  /**
   * Transpile an interface (non data type).
   */
  interface(iface: reflect.InterfaceType): TranspiledInterface;

  /**
   * Transpile a parameter.
   */
  parameter(parameter: reflect.Parameter): TranspiledParameter;

  /**
   * Transpile a property.
   */
  property(property: reflect.Property): TranspiledProperty;

  /**
   * Transpile an enum.
   */
  enum(enu: reflect.EnumType): TranspiledEnum;

  /**
   * Transpile an enum member.
   */
  enumMember(em: reflect.EnumMember): TranspiledEnumMember;

  /**
   * Transpile a type.
   */
  type(type: reflect.Type): TranspiledType;

  /**
   * Transpile (recursively) a type reference.
   */
  typeReference(typeReference: reflect.TypeReference): TranspiledTypeReference;

  /**
   * How a union looks like in the target language.
   */
  unionOf(types: string[]): string;

  /**
   * How a list looks like in the target language.
   */
  listOf(type: string): string;

  /**
   * How a map looks like in the target language.
   */
  mapOf(type: string): string;

  /**
   * How the 'any' type is represented in the target language.
   */
  any(): string;

  /**
   * How the 'string' type is represented in the target language.
   */
  str(): string;

  /**
   * How the 'number' type is represented in the target language.
   */
  number(): string;

  /**
   * How the 'boolean' type is represented in the target language.
   */
  boolean(): string;

  /**
   * How the 'json' type is represented in the target language.
   */
  json(): string;

  /**
   * How the 'date' type is represented in the target language.
   */
  date(): string;

  /**
   * How a readme is displayed in the target language.
   */
  readme(readme: string): string;
}

// interface merging so we don't have to implement these methods
// in the abstract class.
export interface TranspileBase extends Transpile {}

/**
 * Common functionality between different transpilers.
 */
export abstract class TranspileBase implements Transpile {
  constructor(public readonly language: Language) {}

  public type(type: reflect.Type): TranspiledType {
    const submodule = this.findSubmodule(type);
    const moduleLike = this.moduleLike(submodule ? submodule : type.assembly);

    const fqn = [moduleLike.name];

    // TODO - these should also probably be transliterated.
    // for python it just happens to work
    if (type.namespace) {
      fqn.push(type.namespace);
    }
    fqn.push(type.name);

    return {
      fqn: fqn.join('.'),
      name: type.name,
      namespace: type.namespace,
      module: moduleLike.name,
      submodule: moduleLike.submodule,
      source: type,
      language: this.language,
    };
  }

  public typeReference(ref: reflect.TypeReference): TranspiledTypeReference {
    if (ref.type) {
      const transpiled = this.type(ref.type);
      return TranspiledTypeReference.type(this, ref, transpiled);
    }

    if (ref.unionOfTypes) {
      const transpiled = ref.unionOfTypes.map((t) => this.typeReference(t));
      return TranspiledTypeReference.unionOfTypes(this, ref, transpiled);
    }

    if (ref.arrayOfType) {
      const transpiled = this.typeReference(ref.arrayOfType);
      return TranspiledTypeReference.arrayOfType(this, ref, transpiled);
    }

    if (ref.mapOfType) {
      const transpiled = this.typeReference(ref.mapOfType);
      return TranspiledTypeReference.mapOfType(this, ref, transpiled);
    }

    if (ref.isAny) {
      return TranspiledTypeReference.any(this, ref);
    }

    if (ref.primitive) {
      let transpiled;
      switch (ref.primitive) {
        case 'string':
          transpiled = this.str();
          break;
        case 'boolean':
          transpiled = this.boolean();
          break;
        case 'number':
          transpiled = this.number();
          break;
        case 'date':
          transpiled = this.date();
          break;
        case 'json':
          transpiled = this.json();
          break;
        default:
          throw new Error(`Unsupported primitive type '${ref.primitive}'`);
      }
      return TranspiledTypeReference.primitive(this, ref, transpiled);
    }

    throw new Error(`Unsupported type: ${ref.toString()}`);
  }

  protected findSubmodule(type: reflect.Type): reflect.Submodule | undefined {
    if (!type.namespace) {
      return undefined;
    }

    // if the type is in a submodule, the submodule name is the first
    // part of the namespace. we construct the full submodule fqn and search for it.
    const submoduleFqn = `${type.assembly.name}.${
      type.namespace.split('.')[0]
    }`;
    const submodules = type.assembly.submodules.filter(
      (s) => s.fqn === submoduleFqn,
    );

    if (submodules.length > 1) {
      // can never happen, but the array data structure forces this handling.
      throw new Error(`Found multiple submodulues with fqn ${submoduleFqn}`);
    }

    if (submodules.length === 0) {
      return undefined;
    }

    // type is inside this submodule.
    return submodules[0];
  }
}
