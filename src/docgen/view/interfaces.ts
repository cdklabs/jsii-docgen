import * as reflect from 'jsii-reflect';
import { Markdown } from '../render/markdown';
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
      return Markdown.EMPTY;
    }

    const md = new Markdown({ header: { title: 'Protocols' } });

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
