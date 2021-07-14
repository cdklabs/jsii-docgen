export interface TypeJson {
  fqn?: string;
  name: string;
  types?: TypeJson[];
}

export interface PropertyJson {
  id: string;
  name: string;
  optional: boolean;
  deprecated: boolean;
  deprecationReason?: string;
  docs: string;
  type: TypeJson;
  default?: string;
}

export interface ParameterJson extends PropertyJson {}

export interface MethodBase {
  id: string;
  snippet: string;
  parameters: ParameterJson[];
}

export interface InitializerJson extends MethodBase {}

export interface MethodJson extends MethodBase {
  name: string;
}

export interface ClassJson {
  id: string;
  name: string;
  interfaces: TypeJson[];
  docs: string;
  initializer?: InitializerJson;
  instanceMethods: MethodJson[];
  staticMethods: MethodJson[];
  properties: PropertyJson[];
  constants: PropertyJson[];
}

export interface ConstructJson extends ClassJson {}

export interface StructJson {
  id: string;
  name: string;
  docs?: string;
  initializer: string;
  properties: PropertyJson[];
}

export interface InterfaceJson {
  id: string;
  name: string;
  interfaces: TypeJson[];
  implementations: TypeJson[];
  docs: string;
  instanceMethods: MethodJson[];
  properties: PropertyJson[];
}

export interface EnumMemberJson {
  id: string;
  name: string;
  deprecated: boolean;
  deprecationReason?: string;
  docs: string;
}

export interface EnumJson {
  name: string;
  docs: string;
  members: EnumMemberJson[];
}

export interface ApiReferenceJson {
  constructs: ConstructJson[];
  classes: ClassJson[];
  structs: StructJson[];
  interfaces: InterfaceJson[];
  enums: EnumJson[];
}

export interface NavItem {
  display: string;
  url: string;
  children: NavItem[];
}

export interface PackagePageContent {
  readme?: string;
  apiReference?: ApiReferenceJson;
}
