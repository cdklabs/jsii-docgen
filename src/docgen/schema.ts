/**
 * Describes a type.
 */
export interface TypeSchema {

  /**
   * The type FQN. If missing, the type is a reference (array, map..)
   */
  readonly fqn?: string;

  /**
   * The name of the type (Map, List...)
   */
  readonly name: string;

  /**
   * The various types of the reference.
   */
  readonly types?: TypeSchema[];
}

/**
 * Describes a property.
 */
export interface PropertySchema {

  /**
   * Unique id of the property.
   */
  readonly id: string;

  /**
   * Name.
   */
  readonly name: string;

  /**
   * Whether or not the property is optional.
   */
  readonly optional: boolean;

  /**
   * Whether or not the property is deprecated.
   */
  readonly deprecated: boolean;

  /**
   * Deprecation reason (if applicable)
   */
  readonly deprecationReason?: string;

  /**
   * Doc strings of the property.
   */
  readonly docs: string;

  /**
   * The type of the property.
   */
  readonly type: TypeSchema;

  /**
   * The default value of the property
   */
  readonly default?: string;
}

/**
 * Describes a parameter.
 */
export interface ParameterSchema extends PropertySchema {}

/**
 * Common properties of a method.
 */
export interface MethodSchemaBase {

  /**
   * Unique id of the method.
   */
  readonly id: string;

  /**
   * Code snippet to display.
   */
  readonly snippet: string;

  /**
   * Method parameters.
   */
  readonly parameters: ParameterSchema[];
}

/**
 * Describes a constructor.
 */
export interface InitializerSchema extends MethodSchemaBase {}

/**
 * Describes a method.
 */
export interface MethodSchema extends MethodSchemaBase {

  /**
   * Method name.
   */
  readonly name: string;
}

/**
 * Describes a class.
 */
export interface ClassSchema {

  /**
   * Unique class id.
   */
  readonly id: string;

  /**
   * Class name.
   */
  readonly name: string;

  /**
   * Interfaces this class implements.
   */
  readonly interfaces: TypeSchema[];

  /**
   * Doc string for the class.
   */
  readonly docs: string;

  /**
   * Class initializer.
   */
  readonly initializer?: InitializerSchema;

  /**
   * Instance methods.
   */
  readonly instanceMethods: MethodSchema[];

  /**
   * Static functions.
   */
  readonly staticFunctions: MethodSchema[];

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
export interface StructSchema {

  /**
   * Unique struct id.
   */
  readonly id: string;

  /**
   * Struct name.
   */
  readonly name: string;

  /**
   * Doc string of the struct.
   */
  readonly docs?: string;

  /**
   * How to initialize the struct.
   */
  readonly initializer: string;

  /**
   * Properties.
   */
  readonly properties: PropertySchema[];
}

/**
 * Describes an interface.
 */
export interface InterfaceSchema {

  /**
   * Unique interface id.
   */
  readonly id: string;

  /**
   * Interface name.
   */
  readonly name: string;

  /**
   * Interfaces that this interface extends.
   */
  readonly interfaces: TypeSchema[];

  /**
   * Types implementing this interface.
   */
  readonly implementations: TypeSchema[];

  /**
   * Doc string for this interface.
   */
  readonly docs: string;

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
export interface EnumMemberSchema {

  /**
   * Unique enum member id.
   */
  readonly id: string;

  /**
   * Member name.
   */
  readonly name: string;

  /**
   * Whether or not the member is deprecated.
   */
  readonly deprecated: boolean;

  /**
   * Deprecation reason (if applicable).
   */
  readonly deprecationReason?: string;

  /**
   * Doc string of the member.
   */
  readonly docs: string;
}

/**
 * Describes an enum.
 */
export interface EnumSchema {

  /**
   * Enum name.
   */
  readonly name: string;

  /**
   * Doc string for the enum.
   */
  readonly docs: string;

  /**
   * Enum members.
   */
  readonly members: EnumMemberSchema[];
}

/**
 * Describes the Api Reference.
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
   * Readme.
   */
  readonly readme?: string;

  /**
   * Api Reference.
   */
  readonly apiReference?: ApiReferenceSchema;
}
