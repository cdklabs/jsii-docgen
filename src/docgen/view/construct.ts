import * as reflect from 'jsii-reflect';
import { Markdown } from '../render/markdown';
import { ConstructSchema } from '../schema';
import { Transpile, TranspiledType } from '../transpile/transpile';
import { Class } from './class';

export class Construct {
  private readonly construct: Class;
  constructor(transpile: Transpile, klass: reflect.ClassType) {
    this.construct = new Class(transpile, klass);
  }
  public toMarkdown(linkFormatter: (type: TranspiledType) => string): Markdown {
    return this.construct.toMarkdown(linkFormatter);
  }
  public toJson(): ConstructSchema {
    return this.construct.toJson();
  }
}
