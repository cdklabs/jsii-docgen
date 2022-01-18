import * as reflect from 'jsii-reflect';
import { extractDocs, InterfaceSchema, JsiiEntity } from '../schema';
import { Transpile, TranspiledInterface } from '../transpile/transpile';
import { InstanceMethods } from './instance-methods';
import { Properties } from './properties';

export class Interface {
  public static isStruct(iface: reflect.InterfaceType): boolean {
    return iface.datatype;
  }

  private readonly instanceMethods: InstanceMethods;
  private readonly properties: Properties;

  private readonly transpiled: TranspiledInterface;

  constructor(
    private readonly transpile: Transpile,
    private readonly iface: reflect.InterfaceType,
  ) {
    this.transpiled = transpile.interface(iface);
    this.instanceMethods = new InstanceMethods(transpile, iface.ownMethods);
    this.properties = new Properties(transpile, iface.allProperties);
  }

  public toJson(): InterfaceSchema {
    const impls: JsiiEntity[] = this.iface.allImplementations.map((impl) => this.transpile.type(impl).toJson());
    const bases: JsiiEntity[] = this.iface.interfaces.map((base) => this.transpile.type(base).toJson());
    return {
      fqn: this.transpiled.type.fqn,
      displayName: this.transpiled.type.fqn.split('.').pop()!,
      id: this.iface.fqn,
      implementations: impls,
      interfaces: bases,
      instanceMethods: this.instanceMethods.toJson(),
      properties: this.properties.toJson(),
      docs: extractDocs(this.iface.docs),
    };
  }
}
