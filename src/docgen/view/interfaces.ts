import * as reflect from 'jsii-reflect';
import { Markdown } from '../render/markdown';
import { InterfaceSchema } from '../schema';
import { Transpile, TranspiledType } from '../transpile/transpile';
import { Interface } from './interface';

export class Interfaces {
  private readonly interfaces: Interface[];

  constructor(transpile: Transpile, interfaces: reflect.InterfaceType[], linkFormatter: (type: TranspiledType) => string) {
    this.interfaces = interfaces
      .filter((i) => !Interface.isStruct(i))
      .map((i) => new Interface(transpile, i, linkFormatter));
  }
  public toMarkdown(): Markdown {
    if (this.interfaces.length === 0) {
      return Markdown.EMPTY;
    }

    const md = new Markdown({ header: { title: 'Protocols' } });

    for (const iface of this.interfaces) {
      md.section(iface.toMarkdown());
    }

    return md;
  }

  public toJson(): InterfaceSchema[] {
    return this.interfaces.map((iface) => iface.toJson());
  }
}
