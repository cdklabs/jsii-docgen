import * as reflect from 'jsii-reflect';
import { Markdown } from '../render/markdown';
import { InitializerJson } from '../schema';
import { Transpile, TranspiledCallable, TranspiledType } from '../transpile/transpile';
import { Parameter } from './parameter';

export class Initializer {
  private readonly transpiled: TranspiledCallable;
  private readonly parameters: Parameter[];
  constructor(
    private readonly transpile: Transpile,
    initializer: reflect.Initializer,
    linkFormatter: (type: TranspiledType) => string,
  ) {
    this.transpiled = transpile.callable(initializer);
    this.parameters = this.transpiled.parameters.map(
      (p) => new Parameter(this.transpile, p, linkFormatter),
    );
  }

  public render(): Markdown {
    const md = new Markdown({
      id: `${this.transpiled.parentType.fqn}.Initializer`,
      header: {
        title: 'Initializer',
      },
    });

    md.code(
      this.transpile.language.toString(),
      `${this.transpiled.import}`,
      '',
      `${this.transpiled.invocation}`,
    );

    for (const parameter of this.parameters) {
      md.section(parameter.render());
    }

    return md;
  }

  public renderToJson(): InitializerJson {
    const md = new Markdown();
    md.code(
      this.transpile.language.toString(),
      `${this.transpiled.import}`,
      '',
      `${this.transpiled.invocation}`,
    );

    return {
      id: `${this.transpiled.parentType.fqn}.Initializer`,
      snippet: md.render(),
      parameters: this.parameters.map((parameter) => parameter.renderToJson()),
    };
  }
}
