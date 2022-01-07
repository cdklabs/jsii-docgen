import * as reflect from 'jsii-reflect';
import { MarkdownDocument } from '../render/markdown-doc';
import { InterfaceSchema } from '../schema';
import { Transpile } from '../transpile/transpile';
import { MarkdownRenderContext } from './documentation';
import { Interface } from './interface';

export class Interfaces {
  public static toMarkdown(
    ifaces: InterfaceSchema[],
    context: MarkdownRenderContext,
  ) {
    if (ifaces.length === 0) {
      return MarkdownDocument.EMPTY;
    }

    const md = new MarkdownDocument({ header: { title: 'Protocols' } });

    for (const iface of ifaces) {
      md.section(Interface.toMarkdown(iface, context));
    }

    return md;
  }

  private readonly interfaces: Interface[];

  constructor(transpile: Transpile, interfaces: reflect.InterfaceType[]) {
    this.interfaces = interfaces
      .filter((i) => !Interface.isStruct(i))
      .map((i) => new Interface(transpile, i));
  }

  public toJson(): InterfaceSchema[] {
    return this.interfaces.map((iface) => iface.toJson());
  }
}
