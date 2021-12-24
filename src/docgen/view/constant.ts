import * as reflect from 'jsii-reflect';
import { Markdown } from '../render/markdown';
import { PropertySchema } from '../schema';
import { Transpile } from '../transpile/transpile';
import { MarkdownRenderOptions } from './documentation';
import { Property } from './property';

export class Constant {
  public static toMarkdown(
    constant: PropertySchema,
    options: MarkdownRenderOptions,
  ): Markdown {
    return Property.toMarkdown(constant, options);
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
