import * as reflect from 'jsii-reflect';
import { Markdown } from '../render/markdown';
import { EnumJson } from '../schema';
import { Transpile } from '../transpile/transpile';
import { Enum } from './enum';

export class Enums {
  private readonly enums: Enum[];
  constructor(transpile: Transpile, enums: reflect.EnumType[]) {
    this.enums = enums.map((e) => new Enum(transpile, e));
  }

  public render(): Markdown {
    if (this.enums.length === 0) {
      return Markdown.EMPTY;
    }

    const md = new Markdown({ header: { title: 'Enums' } });
    for (const e of this.enums) {
      md.section(e.render());
    }
    return md;
  }

  public renderToJson(): EnumJson[] {
    return this.enums.map((e) => e.renderToJson());
  }
}
