import * as reflect from 'jsii-reflect';
import { Markdown } from '../render/markdown';
import { ClassJson } from '../schema';
import { Transpile, TranspiledType } from '../transpile/transpile';
import { Class } from './class';

export class Classes {
  private readonly classes: Class[];
  constructor(transpile: Transpile, classes: reflect.ClassType[], linkFormatter: (type: TranspiledType) => string) {
    this.classes = classes
      .filter((c) => !Class.isConstruct(c))
      .map((c) => new Class(transpile, c, linkFormatter));
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

  public renderToJson(): ClassJson[] {
    return this.classes.map((klass) => klass.renderToJson());
  }
}
