import * as reflect from 'jsii-reflect';
import { Markdown } from '../render/markdown';
import { Transpile, TranspiledType } from '../transpile/transpile';
import { Property } from './property';

export class Constant {
  private readonly constant: Property;
  constructor(transpile: Transpile, property: reflect.Property, linkFormatter: (type: TranspiledType) => string) {
    this.constant = new Property(transpile, property, linkFormatter, true);
  }
  public render(): Markdown {
    return this.constant.render();
  }
}
