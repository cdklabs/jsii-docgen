import * as reflect from 'jsii-reflect';
import { Markdown } from '../render/markdown';
import { Transpile } from '../transpile/transpile';
import { Constant } from './constant';

export class Constants {
  private readonly constants: Constant[];
  constructor(transpile: Transpile, properties: reflect.Property[]) {
    this.constants = properties
      .filter((p) => !p.protected && p.const)
      .map((p) => new Constant(transpile, p));
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
}
