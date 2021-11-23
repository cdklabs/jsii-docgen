import * as reflect from 'jsii-reflect';
import { anchorForId, Markdown } from '../render/markdown';
import { Transpile, TranspiledParameter, TranspiledType } from '../transpile/transpile';

export class Parameter {
  private readonly transpiled: TranspiledParameter;
  constructor(
    transpile: Transpile,
    private readonly parameter: reflect.Parameter,
    private readonly linkFormatter: (type: TranspiledType) => string,
  ) {
    this.transpiled = transpile.parameter(parameter);
  }

  public get id(): string {
    return `${this.transpiled.parentType.fqn}.parameter.${this.transpiled.name}`;
  }

  public get linkedName(): string {
    const optionality = this.parameter.optional ? 'Optional' : 'Required';
    return `[${Markdown.pre(this.transpiled.name)}](#${anchorForId(this.id)})<sup>${optionality}</sup>`;
  }

  public get type(): string {
    return this.transpiled.typeReference.toString({
      typeFormatter: (t) => `[${Markdown.pre(t.fqn)}](${this.linkFormatter(t)})`,
      stringFormatter: Markdown.pre,
    });
  }

  public get description(): string {
    const summary = this.parameter.docs.summary;
    return summary.length > 0 ? summary : Markdown.italic('No description.');
  }

  public render(): Markdown {
    const optionality = this.parameter.optional ? 'Optional' : 'Required';

    const md = new Markdown({
      id: this.id,
      header: {
        title: this.transpiled.name,
        sup: optionality,
        pre: true,
        strike: this.parameter.docs.deprecated,
      },
    });

    if (this.parameter.docs.deprecated) {
      md.bullet(
        `${Markdown.italic('Deprecated:')} ${
          this.parameter.docs.deprecationReason
        }`,
      );
      md.lines('');
    }

    const metadata: any = { Type: this.type };

    if (this.parameter.spec.docs?.default) {
      metadata.Default = Markdown.sanitize(this.parameter.spec.docs?.default);
    }

    for (const [key, value] of Object.entries(metadata)) {
      md.bullet(`${Markdown.italic(`${key}:`)} ${value}`);
    }
    md.lines('');

    if (this.parameter.docs) {
      md.docs(this.parameter.docs);
    }

    md.split();

    return md;
  }
}
