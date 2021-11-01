import * as reflect from 'jsii-reflect';
import { Markdown } from '../render/markdown';
import { EnumSchema } from '../schema';
import { Transpile } from '../transpile/transpile';
import { Enum } from './enum';

export class Enums {
  private readonly enums: Enum[];
  constructor(transpile: Transpile, enums: reflect.EnumType[]) {
    this.enums = enums.map((e) => new Enum(transpile, e));
  }

  public toMarkdown(): Markdown {
    if (this.enums.length === 0) {
      return Markdown.EMPTY;
    }

    const md = new Markdown({ header: { title: 'Enums' } });
    for (const e of this.enums) {
      md.section(e.toMarkdown());
    }
    return md;
  }

  public toJson(): EnumSchema[] {
    return this.enums.map((e) => e.toJson());
  }
}
