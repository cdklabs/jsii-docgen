import * as reflect from 'jsii-reflect';
import { MarkdownDocument } from '../render/markdown-doc';
import { StructSchema } from '../schema';
import { Transpile } from '../transpile/transpile';
import { MarkdownRenderContext } from './documentation';
import { Interface } from './interface';
import { Struct } from './struct';

export class Structs {
  public static toMarkdown(
    structs: StructSchema[],
    context: MarkdownRenderContext,
  ): MarkdownDocument {
    if (structs.length === 0) {
      return MarkdownDocument.EMPTY;
    }

    const md = new MarkdownDocument({ header: { title: 'Structs' } });
    for (const struct of structs) {
      md.section(Struct.toMarkdown(struct, context));
    }
    return md;
  }

  private readonly structs: Struct[];
  constructor(transpile: Transpile, interfaces: reflect.InterfaceType[]) {
    this.structs = interfaces
      .filter((i) => Interface.isStruct(i))
      .map((i) => new Struct(transpile, i));
  }

  public toJson(): StructSchema[] {
    return this.structs.map((s) => s.toJson());
  }
}
