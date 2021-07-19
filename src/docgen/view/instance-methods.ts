import * as reflect from 'jsii-reflect';
import { Markdown } from '../render/markdown';
import { MethodSchema } from '../schema';
import { Transpile, TranspiledType } from '../transpile/transpile';
import { InstanceMethod } from './instance-method';

export class InstanceMethods {
  private readonly instanceMethods: InstanceMethod[];
  constructor(transpile: Transpile, methods: reflect.Method[], linkFormatter: (type: TranspiledType) => string) {
    this.instanceMethods = methods
      .filter((m) => !m.protected && !m.static)
      .map((m) => new InstanceMethod(transpile, m, linkFormatter));
  }

  public toMarkdown(): Markdown {
    if (this.instanceMethods.length === 0) {
      return Markdown.EMPTY;
    }

    const md = new Markdown({ header: { title: 'Methods' } });
    for (const method of this.instanceMethods) {
      md.section(method.toMarkdown());
    }
    return md;
  }

  public toJson(): MethodSchema[] {
    return this.instanceMethods.map((method) => method.toJson());
  }
}
