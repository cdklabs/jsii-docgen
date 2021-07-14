import * as reflect from 'jsii-reflect';
import { Markdown } from '../render/markdown';
import { InterfaceJson } from '../schema';
import { Transpile, TranspiledInterface, TranspiledType } from '../transpile/transpile';
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
    private readonly linkFormatter: (type: TranspiledType) => string,
  ) {
    this.transpiled = transpile.interface(iface);
    this.instanceMethods = new InstanceMethods(transpile, iface.ownMethods, linkFormatter);
    this.properties = new Properties(transpile, iface.allProperties, linkFormatter);
  }

  public render(): Markdown {
    const md = new Markdown({
      id: this.transpiled.type.fqn,
      header: { title: this.transpiled.name },
    });

    if (this.iface.interfaces.length > 0) {
      const ifaces = [];
      for (const iface of this.iface.interfaces) {
        const transpiled = this.transpile.type(iface);
        ifaces.push(`[${Markdown.pre(transpiled.fqn)}](${this.linkFormatter(transpiled)})`);
      }
      md.bullet(`${Markdown.italic('Extends:')} ${ifaces.join(', ')}`);
      md.lines('');
    }

    if (this.iface.allImplementations.length > 0) {
      const impls = [];
      for (const impl of this.iface.allImplementations) {
        const transpiled = this.transpile.type(impl);
        impls.push(`[${Markdown.pre(transpiled.fqn)}](${this.linkFormatter(transpiled)})`);
      }
      md.bullet(`${Markdown.italic('Implemented By:')} ${impls.join(', ')}`);
      md.lines('');
    }

    if (this.iface.docs) {
      md.docs(this.iface.docs);
    }

    md.section(this.instanceMethods.render());
    md.section(this.properties.render());
    return md;
  }

  public renderToJson(): InterfaceJson {
    return {
      id: this.transpiled.type.fqn,
      name: this.transpiled.name,
      interfaces: this.iface.interfaces.map((iface) => {
        const transpiled = this.transpile.type(iface);
        return {
          fqn: iface.fqn,
          name: transpiled.fqn,
        };
      }),
      implementations: this.iface.allImplementations.map((impl) => {
        const transpiled = this.transpile.type(impl);
        return {
          fqn: impl.fqn,
          name: transpiled.fqn,
        };
      }),
      docs: this.iface.docs.toString(),
      instanceMethods: this.instanceMethods.renderToJson(),
      properties: this.properties.renderToJson(),
    };
  }
}
