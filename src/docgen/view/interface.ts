import * as reflect from 'jsii-reflect';
import { Markdown } from '../render/markdown';
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

    md.section(this.properties.render());
    md.section(this.instanceMethods.render());
    return md;
  }
}
