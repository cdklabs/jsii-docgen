import * as reflect from 'jsii-reflect';
import { Markdown } from '../render/markdown';
import { Transpile, TranspiledCallable } from '../transpile/transpile';
import { Parameter } from './parameter';

export class StaticFunction {
  private readonly transpiled: TranspiledCallable;
  private readonly parameters: Parameter[];
  constructor(
    private readonly transpile: Transpile,
    private readonly method: reflect.Method,
  ) {
    this.transpiled = transpile.callable(method);
    this.parameters = this.transpiled.parameters.map(
      (p) => new Parameter(this.transpile, p),
    );
  }

  public render(): Markdown {
    const md = new Markdown({
      id: `${this.transpiled.parentType.fqn}.${this.transpiled.name}`,
      header: {
        title: this.transpiled.name,
        pre: true,
        strike: this.method.docs.deprecated,
      },
    });

    md.code(
      this.transpile.language,
      `${this.transpiled.import}`,
      '',
      `${this.transpiled.invocation}`,
    );

    for (const parameter of this.parameters) {
      md.section(parameter.render());
    }

    return md;
  }
}
