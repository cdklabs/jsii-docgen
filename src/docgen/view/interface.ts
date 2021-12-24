import * as reflect from 'jsii-reflect';
import { defaultLinkFormatter, Markdown } from '../render/markdown';
import { InterfaceSchema, TypeSchema } from '../schema';
import { Transpile, TranspiledInterface } from '../transpile/transpile';
import { extractDocs } from '../util';
import { MarkdownRenderOptions } from './documentation';
import { InstanceMethods } from './instance-methods';
import { Properties } from './properties';

export class Interface {
  public static toMarkdown(
    iface: InterfaceSchema,
    options: MarkdownRenderOptions,
  ): Markdown {
    const md = new Markdown({
      id: iface.id,
      header: { title: iface.fqn.split('.').pop() },
    });

    const linkFormatter = options.linkFormatter ?? defaultLinkFormatter;

    if (iface.interfaces.length > 0) {
      const bases = [];
      for (const base of iface.interfaces) {
        bases.push(linkFormatter(base.fqn!, base.id!));
      }
      md.bullet(`${Markdown.italic('Extends:')} ${bases.join(', ')}`);
      md.lines('');
    }

    if (iface.implementations.length > 0) {
      const impls = [];
      for (const impl of iface.implementations) {
        impls.push(linkFormatter(impl.fqn!, impl.id!));
      }
      md.bullet(`${Markdown.italic('Implemented By:')} ${impls.join(', ')}`);
      md.lines('');
    }

    if (iface.docs) {
      md.docs(iface.docs);
    }

    md.section(InstanceMethods.toMarkdown(iface.instanceMethods, options));
    md.section(Properties.toMarkdown(iface.properties, options));
    return md;
  }

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
    const impls: TypeSchema[] = this.iface.allImplementations.map((impl) => this.transpile.type(impl).toJson());
    const bases: TypeSchema[] = this.iface.interfaces.map((base) => this.transpile.type(base).toJson());
    return {
      fqn: this.transpiled.type.fqn,
      id: this.iface.fqn,
      implementations: impls,
      interfaces: bases,
      instanceMethods: this.instanceMethods.toJson(),
      properties: this.properties.toJson(),
      docs: extractDocs(this.iface.docs),
    };
  }
}
