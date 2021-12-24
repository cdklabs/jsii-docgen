import * as reflect from 'jsii-reflect';
import { Markdown } from '../render/markdown';
import { ConstructSchema } from '../schema';
import { Transpile } from '../transpile/transpile';
import { Class } from './class';
import { Construct } from './construct';
import { MarkdownRenderOptions } from './documentation';

export class Constructs {
  public static toMarkdown(
    constructs: ConstructSchema[],
    options: MarkdownRenderOptions,
  ): Markdown {
    if (constructs.length === 0) {
      return Markdown.EMPTY;
    }

    const md = new Markdown({ header: { title: 'Constructs' } });
    for (const construct of constructs) {
      md.section(Construct.toMarkdown(construct, options));
    }
    return md;
  }

  private readonly constructs: Construct[];
  constructor(transpile: Transpile, classes: reflect.ClassType[]) {
    this.constructs = classes
      .filter((c) => Class.isConstruct(c))
      .map((c) => new Construct(transpile, c));
  }

  public toJson(): ConstructSchema[] {
    return this.constructs.map((construct) => construct.toJson());
  }
}
