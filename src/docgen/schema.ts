/**
 * Describes a type.
 */
export interface TypeSchema {
  /**
   * The language-specific name of the type. May contain "%" placeholder
   * values to indicate references to types in the "types" array field.
   *
   * @example "%"
   * @example "typing.List[%]"
   * @example "Map<%, %>"
   */
  readonly name: string;

  /**
   * The language-specific type FQN.
   *
   * If undefined, the type is either a primitive, a type union, or a
   * collection type.
   */
  readonly fqn?: string;

  /**
   * An id that uniquely identifies this type among all entities in the
   * document and is same across languages.
   *
   * If undefined, the type is either a primitive, a type union, or a
   * collection type.
   */
  readonly id?: string;

  /**
   * Types referred to within the "name".
   */
  readonly types?: TypeSchema[];
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
   * The language-specific fqn. The last part after splitting by "." is
   * the property name.
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
   * The language-specific fqn. The last part after splitting by "." is
   * the parameter name.
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
   * The language-specific fqn. The last part after splitting by "." is
   * the method name.
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
   * The language-specific fqn. The last part after splitting by "." is
   * the class name.
   */
  readonly fqn: string;

  /**
   * Interfaces this class implements.
   */
  readonly interfaces: TypeSchema[];

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
   * The language-specific fqn. The last part after splitting by "." is
   * the struct name.
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
   * The language-specific fqn. The last part after splitting by "." is
   * the interface name.
   */
  readonly fqn: string;

  /**
   * Interfaces that this interface extends.
   */
  readonly interfaces: TypeSchema[];

  /**
   * Types implementing this interface.
   */
  readonly implementations: TypeSchema[];

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
   * The language-specific fqn. The last part after splitting by "." is
   * the member name.
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
   * The language-specific fqn. The last part after splitting by "." is
   * the enum name.
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
 * Describes the schema.
 */
export interface Schema {
  /**
   * Schema version number.
   */
  readonly version: string;

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
