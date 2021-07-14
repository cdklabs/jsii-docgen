import * as reflect from 'jsii-reflect';
import { Markdown } from '../render/markdown';
import { ConstructJson } from '../schema';
import { Transpile, TranspiledType } from '../transpile/transpile';
import { Class } from './class';
import { Construct } from './construct';

export class Constructs {
  private readonly constructs: Construct[];
  constructor(transpile: Transpile, classes: reflect.ClassType[], linkFormatter: (type: TranspiledType) => string) {
    this.constructs = classes
      .filter((c) => Class.isConstruct(c))
      .map((c) => new Construct(transpile, c, linkFormatter));
  }

  public render(): Markdown {
    if (this.constructs.length === 0) {
      return Markdown.EMPTY;
    }

    const md = new Markdown({ header: { title: 'Constructs' } });
    for (const construct of this.constructs) {
      md.section(construct.render());
    }
    return md;
  }

  public renderToJson(): ConstructJson[] {
    return this.constructs.map((construct) => construct.renderToJson());
  }
}
