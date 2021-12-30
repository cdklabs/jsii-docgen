import * as reflect from 'jsii-reflect';
import { Markdown } from '../render/markdown';
import { ConstructSchema } from '../schema';
import { Transpile } from '../transpile/transpile';
import { Class } from './class';
import { MarkdownRenderContext } from './documentation';

export class Construct {
  public static toMarkdown(
    construct: ConstructSchema,
    context: MarkdownRenderContext,
  ): Markdown {
    return Class.toMarkdown(construct, context);
  }

  private readonly construct: Class;
  constructor(transpile: Transpile, klass: reflect.ClassType) {
    this.construct = new Class(transpile, klass);
  }

  public toJson(): ConstructSchema {
    return this.construct.toJson();
  }
}
