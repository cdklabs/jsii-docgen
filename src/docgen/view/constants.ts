import * as reflect from 'jsii-reflect';
import { Markdown } from '../render/markdown';
import { PropertyJson } from '../schema';
import { Transpile, TranspiledType } from '../transpile/transpile';
import { Constant } from './constant';

export class Constants {
  private readonly constants: Constant[];
  constructor(transpile: Transpile, properties: reflect.Property[], linkFormatter: (type: TranspiledType) => string) {
    this.constants = properties
      .filter((p) => !p.protected && p.const)
      .map((p) => new Constant(transpile, p, linkFormatter));
  }

  public render(): Markdown {
    if (this.constants.length === 0) {
      return Markdown.EMPTY;
    }

    const md = new Markdown({ header: { title: 'Constants' } });
    for (const c of this.constants) {
      md.section(c.render());
    }
    return md;
  }

  public renderToJson(): PropertyJson[] {
    return this.constants.map((constant) => constant.renderToJson());
  }
}
