import * as reflect from 'jsii-reflect';
import { Markdown } from '../render/markdown';
import { PropertyJson } from '../schema';
import { Transpile, TranspiledProperty, TranspiledType } from '../transpile/transpile';

export class Property {
  private readonly transpiled: TranspiledProperty;
  constructor(
    transpile: Transpile,
    private readonly property: reflect.Property,
    private readonly linkFormatter: (type: TranspiledType) => string,
  ) {
    this.transpiled = transpile.property(property);
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

    const metadata: any = {
      Type: this.transpiled.typeReference.toString({
        typeFormatter: (t) => `[${Markdown.pre(t.fqn)}](${this.linkFormatter(t)})`,
        stringFormatter: Markdown.pre,
      }),
    };

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

  public renderToJson(): PropertyJson {
    return {
      id: `${this.transpiled.parentType.fqn}.${this.transpiled.name}`,
      name: this.transpiled.name,
      optional: this.property.const ? false : this.property.optional,
      deprecated: this.property.docs.deprecated,
      deprecationReason: this.property.docs.deprecationReason,
      docs: this.property.docs.toString(),
      default: this.property.spec.docs?.default,
      type: this.transpiled.typeReference.toJson(),
    };
  }
}
