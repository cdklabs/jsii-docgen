import * as reflect from 'jsii-reflect';
import { Markdown } from '../render/markdown';
import { MethodSchema } from '../schema';
import { Transpile, TranspiledCallable, TranspiledType } from '../transpile/transpile';
import { Parameter } from './parameter';

export class StaticFunction {
  private readonly transpiled: TranspiledCallable;
  private readonly parameters: Parameter[];
  constructor(
    private readonly transpile: Transpile,
    private readonly method: reflect.Method,
    linkFormatter: (type: TranspiledType) => string,
  ) {
    this.transpiled = transpile.callable(method);
    this.parameters = this.transpiled.parameters.map(
      (p) => new Parameter(this.transpile, p, linkFormatter),
    );
  }

  public toMarkdown(): Markdown {
    const md = new Markdown({
      id: `${this.transpiled.parentType.fqn}.${this.transpiled.name}`,
      header: {
        title: this.transpiled.name,
        pre: true,
        strike: this.method.docs.deprecated,
      },
    });

    md.code(
      this.transpile.language.toString(),
      `${this.transpiled.import}`,
      '',
      ...this.transpiled.invocations,
    );

    for (const parameter of this.parameters) {
      md.section(parameter.toMarkdown());
    }

    return md;
  }

  public toJson(): MethodSchema {
    const md = new Markdown();
    md.code(
      this.transpile.language.toString(),
      `${this.transpiled.import}`,
      '',
      ...this.transpiled.invocations,
    );

    return {
      id: `${this.transpiled.parentType.fqn}.Initializer`,
      name: this.transpiled.name,
      snippet: md.render(),
      parameters: this.parameters.map((parameter) => parameter.toJson()),
    };
  }
}
