import * as reflect from 'jsii-reflect';
import { anchorForId, Markdown } from '../render/markdown';
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

  public get id(): string {
    return `${this.transpiled.parentType.fqn}.${this.transpiled.name}`;
  }

  public get linkedName(): string {
    return `[${Markdown.pre(this.transpiled.name)}](#${anchorForId(this.id)})`;
  }

  public get description(): string {
    const summary = this.method.docs.summary;
    return summary.length > 0 ? summary : Markdown.italic('No description.');
  }

  public render(): Markdown {
    const md = new Markdown({
      id: this.id,
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
      md.section(parameter.render());
    }

    return md;
  }
}
