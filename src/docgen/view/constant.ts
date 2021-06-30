import * as reflect from 'jsii-reflect';
import { Markdown } from '../render/markdown';
import { Transpile } from '../transpile/transpile';
import { Property } from './property';

export class Constant {
  private readonly constant: Property;
  constructor(transpile: Transpile, property: reflect.Property) {
    this.constant = new Property(transpile, property);
  }
  public render(): Markdown {
    return this.constant.render();
  }
}
