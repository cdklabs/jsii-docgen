import * as reflect from 'jsii-reflect';
import { Markdown } from '../render/markdown';
import { Transpile, TranspiledType } from '../transpile/transpile';
import { InstanceMethod } from './instance-method';

export class InstanceMethods {
  private readonly instanceMethods: InstanceMethod[];
  constructor(transpile: Transpile, methods: reflect.Method[], linkFormatter: (type: TranspiledType) => string) {
    this.instanceMethods = methods
      .filter((m) => !m.protected && !m.static)
      .map((m) => new InstanceMethod(transpile, m, linkFormatter));
  }

  public render(): Markdown {
    if (this.instanceMethods.length === 0) {
      return Markdown.EMPTY;
    }

    const md = new Markdown({ header: { title: 'Methods' } });

    md.table([
      ['Name', 'Description'].map(Markdown.bold),
      ...this.instanceMethods.map((method) => [method.linkedName, Markdown.sanitize(method.description)]),
    ]);
    md.split();

    for (const method of this.instanceMethods) {
      md.section(method.render());
    }
    return md;
  }
}
