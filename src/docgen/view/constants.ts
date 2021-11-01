import * as reflect from 'jsii-reflect';
import { Markdown } from '../render/markdown';
import { PropertySchema } from '../schema';
import { Transpile, TranspiledType } from '../transpile/transpile';
import { Constant } from './constant';

export class Constants {
  private readonly constants: Constant[];
  constructor(transpile: Transpile, properties: reflect.Property[]) {
    this.constants = properties
      .filter((p) => !p.protected && p.const)
      .map((p) => new Constant(transpile, p));
  }

  public toMarkdown(linkFormatter: (type: TranspiledType) => string): Markdown {
    if (this.constants.length === 0) {
      return Markdown.EMPTY;
    }

    const md = new Markdown({ header: { title: 'Constants' } });
    for (const c of this.constants) {
      md.section(c.toMarkdown(linkFormatter));
    }
    return md;
  }

  public toJson(): PropertySchema[] {
    return this.constants.map((constant) => constant.toJson());
  }
}
