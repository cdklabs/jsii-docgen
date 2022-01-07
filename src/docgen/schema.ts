/**
 * Describes any kind of type. This could be a primitive, a user-defined type
 * (like `Bucket`), or a composition of types (like `Map<string, Bucket>[]`).
 */
export interface TypeSchema {
  /**
   * The language-specific name of the type. May contain "%" placeholder
   * values to indicate references to types defined in the "types" field.
   *
   * @example "string"
   * @example "%"
   * @example "typing.List[%]"
   * @example "Map<%, %>"
   */
  readonly formattingPattern: string;

  /**
   * Types referenced within the "name" field.
   */
  readonly types?: (TypeSchema | JsiiEntity)[];
}

/**
 * Describes a single "entity" in the jsii type system. This may be a type,
 * but it could also be a property, method, parameter, enum member, etc.
 */
export interface JsiiEntity extends AssemblyMetadataSchema {
  /**
   * An id that uniquely identifies this type among all entities in the
   * document and is same across languages.
   */
  readonly id: string;

  /**
   * The friendly language-specific name for the entity.
   */
  readonly displayName: string;

  /**
   * The language-specific type FQN.
   */
  readonly fqn: string;
}

/**
 * Describes a property.
 */
export interface PropertySchema extends Usage, Optional, Documentable {
  /**
   * An id that uniquely identifies this property among all entities in
   * the document and is same across languages.
   */
  readonly id: string;

  /**
   * The friendly language-specific name for the property.
   */
  readonly displayName: string;

  /**
   * The language-specific fqn.
   */
  readonly fqn: string;

  /**
   * The type of the property.
   */
  readonly type: TypeSchema;

  /**
   * Whether the property is a constant.
   * @default false
   */
  readonly const?: boolean;
}

/**
 * Describes a parameter.
 */
export interface ParameterSchema extends Optional, Documentable {
  /**
   * An id that uniquely identifies this parameter among all entities in
   * the document and is same across languages.
   */
  readonly id: string;

  /**
   * The friendly language-specific name for the parameter.
   */
  readonly displayName: string;

  /**
   * The language-specific fqn.
   */
  readonly fqn: string;

  /**
   * The type of the parameter.
   */
  readonly type: TypeSchema;

}

/**
 * Common properties of a callable.
 */
export interface CallableSchema extends Usage {
  /**
   * An id that uniquely identifies this callable among all entities in
   * the document and is same across languages.
   */
  readonly id: string;

  /**
   * The friendly language-specific name for the callable.
   */
  readonly displayName: string;

  /**
   * The language-specific fqn.
   */
  readonly fqn: string;

  /**
   * Parameters of the callable.
   */
  readonly parameters: ParameterSchema[];
}

/**
 * Describes a constructor.
 */
export interface InitializerSchema extends CallableSchema {}

/**
 * Describes a method.
 */
export interface MethodSchema extends CallableSchema, Documentable {}

/**
 * Describes a class.
 */
export interface ClassSchema extends Documentable {
  /**
   * An id that uniquely identifies this class among all entities in
   * the document and is same across languages.
   */
  readonly id: string;

  /**
   * The friendly language-specific name for the class.
   */
  readonly displayName: string;

  /**
   * The language-specific fqn.
   */
  readonly fqn: string;

  /**
   * Interfaces this class implements.
   */
  readonly interfaces: JsiiEntity[];

  /**
   * Class initializer.
   */
  readonly initializer?: InitializerSchema;

  /**
   * Instance methods.
   */
  readonly instanceMethods: MethodSchema[];

  /**
   * Static methods.
   */
  readonly staticMethods: MethodSchema[];

  /**
   * Properties.
   */
  readonly properties: PropertySchema[];

  /**
   * Constants.
   */
  readonly constants: PropertySchema[];
}

/**
 * Describes a construct.
 */
export interface ConstructSchema extends ClassSchema {}

/**
 * Describes a struct.
 */
export interface StructSchema extends Usage, Documentable {
  /**
   * An id that uniquely identifies this struct among all entities in
   * the document and is same across languages.
   */
  readonly id: string;

  /**
   * The friendly language-specific name for the struct.
   */
  readonly displayName: string;

  /**
   * The language-specific fqn.
   */
  readonly fqn: string;

  /**
   * Properties.
   */
  readonly properties: PropertySchema[];
}

/**
 * Describes a behavioral interface, also sometimes known as a protocol.
 */
export interface InterfaceSchema extends Documentable {
  /**
   * An id that uniquely identifies this interface among all entities in
   * the document and is same across languages.
   */
  readonly id: string;

  /**
   * The friendly language-specific name for the interface.
   */
  readonly displayName: string;

  /**
   * The language-specific fqn.
   */
  readonly fqn: string;

  /**
   * Interfaces that this interface extends.
   */
  readonly interfaces: JsiiEntity[];

  /**
   * Types implementing this interface.
   */
  readonly implementations: JsiiEntity[];

  /**
   * Methods.
   */
  readonly instanceMethods: MethodSchema[];

  /**
   * Properties.
   */
  readonly properties: PropertySchema[];
}

/**
 * Describes an enum member.
 */
export interface EnumMemberSchema extends Documentable {
  /**
   * An id that uniquely identifies this enum member among all entities in
   * the document and is same across languages.
   */
  readonly id: string;

  /**
   * The friendly language-specific name for the enum member.
   */
  readonly displayName: string;

  /**
   * The language-specific fqn.
   */
  readonly fqn: string;
}

/**
 * Describes an enum.
 */
export interface EnumSchema extends Documentable {
  /**
   * An id that uniquely identifies this enum among all entities in
   * the document and is same across languages.
   */
  readonly id: string;

  /**
   * The friendly language-specific name for the enum.
   */
  readonly displayName: string;

  /**
   * The language-specific fqn.
   */
  readonly fqn: string;

  /**
   * Enum members.
   */
  readonly members: EnumMemberSchema[];
}

/**
 * Describes the API Reference.
 */
export interface ApiReferenceSchema {

  /**
   * Constructs.
   */
  readonly constructs: ConstructSchema[];

  /**
   * Classes.
   */
  readonly classes: ClassSchema[];

  /**
   * Structs.
   */
  readonly structs: StructSchema[];

  /**
   * Interfaces.
   */
  readonly interfaces: InterfaceSchema[];

  /**
   * Enums.
   */
  readonly enums: EnumSchema[];
}

/**
 * Metadata about a particular jsii assembly.
 */
export interface AssemblyMetadataSchema {
  /**
   * Name of the jsii assembly/package.
   */
  readonly packageName: string;

  /**
   * Version of the jsii assembly/package.
   */
  readonly packageVersion: string;

  /**
   * Name of the submodule this type is from within the jsii assembly (if any).
   */
  readonly submodule?: string;
}

/**
 * Describes the schema.
 */
export interface Schema {
  /**
   * Schema version number.
   */
  readonly version: string;

  /**
   * Assembly metadata.
   */
  readonly metadata: AssemblyMetadataSchema;

  /**
   * Readme.
   */
  readonly readme?: string;

  /**
   * API Reference.
   */
  readonly apiReference?: ApiReferenceSchema;
}


//
// SHARED INTERFACES
//

/**
 * An entity that can have a doc string.
 */
export interface Documentable {
  /**
   * Doc string.
   */
  readonly docs: DocsSchema;
}

/**
 * Docstring information.
 *
 * @see jsii.Docs
 */
export interface DocsSchema {
  /**
   * Summary documentation for an API item.
   *
   * The first part of the documentation before hitting a `@remarks` tags, or
   * the first line of the doc comment block if there is no `@remarks` tag.
   */
  readonly summary?: string;

  /**
   * Detailed information about an API item.
   *
   * Either the explicitly tagged `@remarks` section, otherwise everything
   * past the first paragraph if there is no `@remarks` tag.
   */
  readonly remarks?: string;

  /**
   * A `@see` link with more information.
   */
  readonly see?: string;

  /**
   * Whether or not it is deprecated.
   */
  readonly deprecated?: boolean;

  /**
   * Deprecation reason (if applicable).
   */
  readonly deprecationReason?: string;
}

/**
 * An entity that may include a code snippet showing how to use it.
 */
export interface Usage {
  /**
   * Code snippet.
   * @default - none
   */
  readonly usage?: string;
}

/**
 * An entity that may be optional.
 */
export interface Optional {
  /**
   * Whether or not it is optional.
   * @default false
   */
  readonly optional?: boolean;

  /**
   * The default value, if applicable.
   * @default - none
   */
  readonly default?: string;
}
