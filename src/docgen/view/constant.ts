import * as reflect from 'jsii-reflect';
import { Markdown } from '../render/markdown';
import { PropertySchema } from '../schema';
import { Transpile, TranspiledType } from '../transpile/transpile';
import { Property } from './property';

export class Constant {
  private readonly constant: Property;
  constructor(transpile: Transpile, property: reflect.Property) {
    this.constant = new Property(transpile, property);
  }
  public toMarkdown(linkFormatter: (type: TranspiledType) => string): Markdown {
    return this.constant.toMarkdown(linkFormatter);
  }
  public toJson(): PropertySchema {
    return this.constant.toJson();
  }
}
