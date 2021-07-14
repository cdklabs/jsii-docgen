import * as reflect from 'jsii-reflect';
import { Markdown } from '../render/markdown';
import { StructJson } from '../schema';
import { Transpile, TranspiledType } from '../transpile/transpile';
import { Interface } from './interface';
import { Struct } from './struct';

export class Structs {
  private readonly structs: Struct[];
  constructor(transpile: Transpile, interfaces: reflect.InterfaceType[], linkFormatter: (type: TranspiledType) => string) {
    this.structs = interfaces
      .filter((i) => Interface.isStruct(i))
      .map((i) => new Struct(transpile, i, linkFormatter));
  }

  public render(): Markdown {
    if (this.structs.length === 0) {
      return Markdown.EMPTY;
    }

    const md = new Markdown({ header: { title: 'Structs' } });
    for (const struct of this.structs) {
      md.section(struct.render());
    }
    return md;
  }

  public renderToJson(): StructJson[] {
    return this.structs.map((struct) => struct.renderToJson());
  }
}
