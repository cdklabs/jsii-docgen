import * as reflect from 'jsii-reflect';
import { Markdown } from '../render/markdown';
import { MethodSchema } from '../schema';
import { Transpile, TranspiledType } from '../transpile/transpile';
import { StaticFunction } from './static-function';

export class StaticFunctions {
  private readonly staticFunctions: StaticFunction[];
  constructor(transpile: Transpile, methods: reflect.Method[]) {
    this.staticFunctions = methods
      .filter((m) => !m.protected && m.static)
      .map((m) => new StaticFunction(transpile, m));
  }

  public toMarkdown(linkFormatter: (type: TranspiledType) => string): Markdown {
    if (this.staticFunctions.length === 0) {
      return Markdown.EMPTY;
    }

    const md = new Markdown({ header: { title: 'Static Functions' } });
    for (const func of this.staticFunctions) {
      md.section(func.toMarkdown(linkFormatter));
    }
    return md;
  }

  public toJson(): MethodSchema[] {
    return this.staticFunctions.map((func) => func.toJson());
  }
}
