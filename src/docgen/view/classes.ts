import * as reflect from 'jsii-reflect';
import { MarkdownDocument } from '../render/markdown-doc';
import { ClassSchema } from '../schema';
import { Transpile } from '../transpile/transpile';
import { Class } from './class';
import { MarkdownRenderContext } from './documentation';

export class Classes {
  public static toMarkdown(
    classes: ClassSchema[],
    context: MarkdownRenderContext,
  ): MarkdownDocument {
    if (classes.length === 0) {
      return MarkdownDocument.EMPTY;
    }

    const md = new MarkdownDocument({ header: { title: 'Classes' } });
    for (const klass of classes) {
      md.section(Class.toMarkdown(klass, context));
    }
    return md;
  }

  private readonly classes: Class[];
  constructor(transpile: Transpile, classes: reflect.ClassType[]) {
    this.classes = classes
      .filter((c) => !Class.isConstruct(c))
      .map((c) => new Class(transpile, c));
  }

  public toJson() {
    return this.classes.map((klass) => klass.toJson());
  }
}
