import * as reflect from 'jsii-reflect';
import { Markdown } from '../render/markdown';
import { Transpile, TranspiledParameter } from '../transpile/transpile';

export class Parameter {
  private readonly transpiled: TranspiledParameter;
  constructor(
    transpile: Transpile,
    private readonly parameter: reflect.Parameter,
  ) {
    this.transpiled = transpile.parameter(parameter);
  }

  public render(): Markdown {
    const optionality = this.parameter.optional ? 'Optional' : 'Required';

    const md = new Markdown({
      id: `${this.transpiled.parentType.fqn}.${this.transpiled.name}`,
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

    const metadata: any = {
      Type: this.transpiled.typeReference.toString({
        typeFormatter: (t) => `[${Markdown.pre(t.fqn)}](#${t.fqn})`,
        stringFormatter: Markdown.pre,
      }),
    };

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
