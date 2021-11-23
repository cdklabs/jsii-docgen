import * as reflect from 'jsii-reflect';
import { Markdown } from '../render/markdown';
import { Transpile, TranspiledProperty, TranspiledType } from '../transpile/transpile';

export class Property {
  private readonly transpiled: TranspiledProperty;
  constructor(
    private readonly transpile: Transpile,
    private readonly property: reflect.Property,
    private readonly linkFormatter: (type: TranspiledType) => string,
  ) {
    this.transpiled = transpile.property(property);
  }

  public get name(): string {
    return this.transpiled.name;
  }

  public get type(): string {
    return this.transpiled.typeReference.toString({
      typeFormatter: (t) => `[${Markdown.pre(t.fqn)}](${this.linkFormatter(t)})`,
      stringFormatter: Markdown.pre,
    });
  }

  public get description(): string {
    const summary = this.property.docs.summary;
    return summary.length > 0 ? summary : Markdown.italic('No description.');
  }

  public render(): Markdown {
    const optionality = this.property.const
      ? undefined
      : this.property.optional
        ? 'Optional'
        : 'Required';

    const md = new Markdown({
      id: `${this.transpiled.parentType.fqn}.property.${this.transpiled.name}`,
      header: {
        title: this.transpiled.name,
        sup: optionality,
        pre: true,
        strike: this.property.docs.deprecated,
      },
    });

    if (this.property.docs.deprecated) {
      md.bullet(
        `${Markdown.italic('Deprecated:')} ${
          this.property.docs.deprecationReason
        }`,
      );
      md.lines('');
    }

    if (!this.property.const) {
      md.code(this.transpile.language.toString(), this.transpiled.declaration);
    }

    const metadata: Record<string, string> = { Type: this.type };

    if (this.property.spec.docs?.default) {
      metadata.Default = Markdown.sanitize(this.property.spec.docs?.default);
    }

    for (const [key, value] of Object.entries(metadata)) {
      md.bullet(`${Markdown.italic(`${key}:`)} ${value}`);
    }
    md.lines('');

    if (this.property.docs) {
      md.docs(this.property.docs);
    }

    md.split();

    return md;
  }
}
