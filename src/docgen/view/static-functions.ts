import * as reflect from 'jsii-reflect';
import { Markdown } from '../render/markdown';
import { MethodJson } from '../schema';
import { Transpile, TranspiledType } from '../transpile/transpile';
import { StaticFunction } from './static-function';

export class StaticFunctions {
  private readonly staticFunctions: StaticFunction[];
  constructor(transpile: Transpile, methods: reflect.Method[], linkFormatter: (type: TranspiledType) => string) {
    this.staticFunctions = methods
      .filter((m) => !m.protected && m.static)
      .map((m) => new StaticFunction(transpile, m, linkFormatter));
  }

  public render(): Markdown {
    if (this.staticFunctions.length === 0) {
      return Markdown.EMPTY;
    }

    const md = new Markdown({ header: { title: 'Static Functions' } });
    for (const func of this.staticFunctions) {
      md.section(func.render());
    }
    return md;
  }

  public renderToJson(): MethodJson[] {
    return this.staticFunctions.map((func) => func.renderToJson());
  }
}
