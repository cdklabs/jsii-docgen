import * as reflect from 'jsii-reflect';
import { Markdown } from '../render/markdown';
import { ConstructJson } from '../schema';
import { Transpile, TranspiledType } from '../transpile/transpile';
import { Class } from './class';

export class Construct {
  private readonly construct: Class;
  constructor(transpile: Transpile, klass: reflect.ClassType, linkFormatter: (type: TranspiledType) => string) {
    this.construct = new Class(transpile, klass, linkFormatter);
  }
  public render(): Markdown {
    return this.construct.render();
  }

  public renderToJson(): ConstructJson {
    return this.construct.renderToJson();
  }
}
