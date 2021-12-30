import * as reflect from 'jsii-reflect';
import { defaultAnchorFormatter, defaultLinkFormatter, Markdown } from '../render/markdown';
import { InterfaceSchema, JsiiEntity } from '../schema';
import { Transpile, TranspiledInterface } from '../transpile/transpile';
import { extractDocs } from '../util';
import { MarkdownRenderContext } from './documentation';
import { InstanceMethods } from './instance-methods';
import { Properties } from './properties';

export class Interface {
  public static toMarkdown(
    iface: InterfaceSchema,
    context: MarkdownRenderContext,
  ): Markdown {
    const anchorFormatter = context.anchorFormatter ?? defaultAnchorFormatter;
    const linkFormatter = context.linkFormatter ?? defaultLinkFormatter;

    const md = new Markdown({
      id: anchorFormatter({
        id: iface.id,
        fqn: iface.fqn,
        packageName: context.packageName,
        packageVersion: context.packageVersion,
        submodule: context.submodule,
      }),
      header: { title: iface.fqn.split('.').pop() },
    });

    if (iface.interfaces.length > 0) {
      const bases = [];
      for (const base of iface.interfaces) {
        bases.push(linkFormatter(base));
      }
      md.bullet(`${Markdown.italic('Extends:')} ${bases.join(', ')}`);
      md.lines('');
    }

    if (iface.implementations.length > 0) {
      const impls = [];
      for (const impl of iface.implementations) {
        impls.push(linkFormatter(impl));
      }
      md.bullet(`${Markdown.italic('Implemented By:')} ${impls.join(', ')}`);
      md.lines('');
    }

    if (iface.docs) {
      md.docs(iface.docs);
    }

    md.section(InstanceMethods.toMarkdown(iface.instanceMethods, context));
    md.section(Properties.toMarkdown(iface.properties, context));
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
    const impls: JsiiEntity[] = this.iface.allImplementations.map((impl) => this.transpile.type(impl).toJson());
    const bases: JsiiEntity[] = this.iface.interfaces.map((base) => this.transpile.type(base).toJson());
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
