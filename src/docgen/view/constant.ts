import * as reflect from 'jsii-reflect';
import { Markdown } from '../render/markdown';
import { Transpile, TranspiledType } from '../transpile/transpile';
import { Property } from './property';

export class Constant {
  private readonly constant: Property;
  constructor(transpile: Transpile, property: reflect.Property, linkFormatter: (type: TranspiledType) => string) {
    this.constant = new Property(transpile, property, linkFormatter);
  }

  public get id(): string {
    return this.constant.id;
  }

  public get linkedName(): string {
    return this.constant.linkedName;
  }

  public get type(): string {
    return this.constant.type;
  }

  public get description(): string {
    return this.constant.description;
  }

  public render(): Markdown {
    return this.constant.render();
  }
}
