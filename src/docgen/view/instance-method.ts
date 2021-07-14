import * as reflect from 'jsii-reflect';
import { Markdown } from '../render/markdown';
import { MethodJson } from '../schema';
import { Transpile, TranspiledCallable, TranspiledType } from '../transpile/transpile';
import { Parameter } from './parameter';

export class InstanceMethod {
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

  public render(): Markdown {
    const md = new Markdown({
      id: `${this.transpiled.parentType.fqn}.${this.transpiled.name}`,
      header: {
        title: this.transpiled.name,
        pre: true,
        strike: this.method.docs.deprecated,
      },
    });

    md.code(this.transpile.language.toString(), this.transpiled.signature);

    for (const parameter of this.parameters) {
      md.section(parameter.render());
    }

    return md;
  }

  public renderToJson(): MethodJson {
    const md = new Markdown();
    md.code(this.transpile.language.toString(), this.transpiled.signature);
    return {
      id: `${this.transpiled.parentType.fqn}.${this.transpiled.name}`,
      name: this.transpiled.name,
      snippet: md.render(),
      parameters: this.parameters.map((parameter) => parameter.renderToJson()),
    };
  }
}
