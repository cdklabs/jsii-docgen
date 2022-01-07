import * as reflect from 'jsii-reflect';
import { MarkdownDocument } from '../render/markdown-doc';
import { PropertySchema } from '../schema';
import { Transpile } from '../transpile/transpile';
import { MarkdownRenderContext } from './documentation';
import { Property } from './property';

export class Constant {
  public static toMarkdown(
    constant: PropertySchema,
    context: MarkdownRenderContext,
  ): MarkdownDocument {
    return Property.toMarkdown(constant, context);
  }

  private readonly constant: Property;
  constructor(transpile: Transpile, property: reflect.Property) {
    this.constant = new Property(transpile, property);
  }

  public toJson(): PropertySchema {
    return {
      ...this.constant.toJson(),
      const: true,
    };
  }
}
