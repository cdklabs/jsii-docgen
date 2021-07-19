import * as reflect from 'jsii-reflect';
import { Markdown } from '../render/markdown';
import { ConstructSchema } from '../schema';
import { Transpile, TranspiledType } from '../transpile/transpile';
import { Class } from './class';

export class Construct {
  private readonly construct: Class;
  constructor(transpile: Transpile, klass: reflect.ClassType, linkFormatter: (type: TranspiledType) => string) {
    this.construct = new Class(transpile, klass, linkFormatter);
  }
  public toMarkdown(): Markdown {
    return this.construct.toMarkdown();
  }

  public toJson(): ConstructSchema {
    return this.construct.toJson();
  }
}
