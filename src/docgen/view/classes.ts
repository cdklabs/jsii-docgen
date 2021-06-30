import * as reflect from 'jsii-reflect';
import { Markdown } from '../render/markdown';
import { Transpile } from '../transpile/transpile';
import { Class } from './class';

export class Classes {
  private readonly classes: Class[];
  constructor(transpile: Transpile, classes: reflect.ClassType[]) {
    this.classes = classes
      .filter((c) => !Class.isConstruct(c))
      .map((c) => new Class(transpile, c));
  }

  public render(): Markdown {
    if (this.classes.length === 0) {
      return Markdown.EMPTY;
    }

    const md = new Markdown({ header: { title: 'Classes' } });
    for (const klass of this.classes) {
      md.section(klass.render());
    }
    return md;
  }
}
