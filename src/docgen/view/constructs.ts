import * as reflect from 'jsii-reflect';
import { MarkdownDocument } from '../render/markdown-doc';
import { ConstructSchema } from '../schema';
import { Transpile } from '../transpile/transpile';
import { Class } from './class';
import { Construct } from './construct';
import { MarkdownRenderContext } from './documentation';

export class Constructs {
  public static toMarkdown(
    constructs: ConstructSchema[],
    context: MarkdownRenderContext,
  ): MarkdownDocument {
    if (constructs.length === 0) {
      return MarkdownDocument.EMPTY;
    }

    const md = new MarkdownDocument({ header: { title: 'Constructs' } });
    for (const construct of constructs) {
      md.section(Construct.toMarkdown(construct, context));
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
