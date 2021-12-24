import * as reflect from 'jsii-reflect';
import { Markdown } from '../render/markdown';
import { EnumSchema } from '../schema';
import { Transpile } from '../transpile/transpile';
import { MarkdownRenderOptions } from './documentation';
import { Enum } from './enum';

export class Enums {
  public static toMarkdown(
    enums: EnumSchema[],
    options: MarkdownRenderOptions,
  ): Markdown {
    if (enums.length === 0) {
      return Markdown.EMPTY;
    }

    const md = new Markdown({ header: { title: 'Enums' } });
    for (const enu of enums) {
      md.section(Enum.toMarkdown(enu, options));
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
