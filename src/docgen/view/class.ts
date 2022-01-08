import * as reflect from 'jsii-reflect';
import { ClassSchema } from '../schema';
import { Transpile, TranspiledClass } from '../transpile/transpile';
import { extractDocs } from '../util';
import { Constants } from './constants';
import { Initializer } from './initializer';
import { InstanceMethods } from './instance-methods';
import { Properties } from './properties';
import { StaticFunctions } from './static-functions';

const CONSTRUCT_CLASS = 'constructs.Construct';

export class Class {
  public static isConstruct(klass: reflect.ClassType): boolean {
    if (klass.fqn === CONSTRUCT_CLASS) return true;

    if (!klass.base) {
      return false;
    }

    return this.isConstruct(klass.base);
  }

  private readonly transpiled: TranspiledClass;

  private readonly initializer?: Initializer;
  private readonly instanceMethods: InstanceMethods;
  private readonly staticFunctions: StaticFunctions;
  private readonly constants: Constants;
  private readonly properties: Properties;

  constructor(
    private readonly transpile: Transpile,
    private readonly klass: reflect.ClassType,
  ) {
    if (klass.initializer) {
      this.initializer = new Initializer(transpile, klass.initializer);
    }
    this.instanceMethods = new InstanceMethods(transpile, klass.ownMethods);
    this.staticFunctions = new StaticFunctions(transpile, klass.ownMethods);
    this.constants = new Constants(transpile, klass.ownProperties);
    this.properties = new Properties(transpile, klass.ownProperties);
    this.transpiled = transpile.class(klass);
  }

  public toJson(): ClassSchema {
    const interfaces = this.klass.interfaces.map((iface) => this.transpile.type(iface).toJson());
    return {
      initializer: this.initializer?.toJson(),
      interfaces: interfaces,
      instanceMethods: this.instanceMethods.toJson(),
      staticMethods: this.staticFunctions.toJson(),
      constants: this.constants.toJson(),
      properties: this.properties.toJson(),
      fqn: this.transpiled.type.fqn,
      displayName: this.transpiled.type.fqn.split('.').pop()!,
      id: this.klass.fqn,
      docs: extractDocs(this.klass.docs),
    };
  }
}
