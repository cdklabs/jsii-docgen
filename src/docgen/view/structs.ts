import * as reflect from 'jsii-reflect';
import { Markdown } from '../render/markdown';
import { StructSchema } from '../schema';
import { Transpile, TranspiledType } from '../transpile/transpile';
import { Interface } from './interface';
import { Struct } from './struct';

export class Structs {
  private readonly structs: Struct[];
  constructor(transpile: Transpile, interfaces: reflect.InterfaceType[]) {
    this.structs = interfaces
      .filter((i) => Interface.isStruct(i))
      .map((i) => new Struct(transpile, i));
  }

  public toMarkdown(linkFormatter: (type: TranspiledType) => string): Markdown {
    if (this.structs.length === 0) {
      return Markdown.EMPTY;
    }

    const md = new Markdown({ header: { title: 'Structs' } });
    for (const struct of this.structs) {
      md.section(struct.toMarkdown(linkFormatter));
    }
    return md;
  }

  public toJson(): StructSchema[] {
    return this.structs.map((struct) => struct.toJson());
  }
}
