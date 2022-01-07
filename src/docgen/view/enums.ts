import * as reflect from 'jsii-reflect';
import { MarkdownDocument } from '../render/markdown-doc';
import { EnumSchema } from '../schema';
import { Transpile } from '../transpile/transpile';
import { MarkdownRenderContext } from './documentation';
import { Enum } from './enum';

export class Enums {
  public static toMarkdown(
    enums: EnumSchema[],
    context: MarkdownRenderContext,
  ): MarkdownDocument {
    if (enums.length === 0) {
      return MarkdownDocument.EMPTY;
    }

    const md = new MarkdownDocument({ header: { title: 'Enums' } });
    for (const enu of enums) {
      md.section(Enum.toMarkdown(enu, context));
    }
    return md;
  }

  private readonly enums: Enum[];
  constructor(transpile: Transpile, enums: reflect.EnumType[]) {
    this.enums = enums.map((e) => new Enum(transpile, e));
  }

  public toJson(): EnumSchema[] {
    return this.enums.map((enu) => enu.toJson());
  }
}
