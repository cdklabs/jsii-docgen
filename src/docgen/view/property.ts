import * as reflect from 'jsii-reflect';
import { defaultAnchorFormatter, defaultLinkFormatter, defaultTypeFormatter, Markdown } from '../render/markdown';
import { PropertySchema } from '../schema';
import { Transpile, TranspiledProperty } from '../transpile/transpile';
import { extractDocs } from '../util';
import { MarkdownRenderOptions } from './documentation';

export class Property {
  public static toMarkdown(
    property: PropertySchema,
    options: MarkdownRenderOptions,
  ): Markdown {
    const anchorFormatter = options.anchorFormatter ?? defaultAnchorFormatter;
    const linkFormatter = options.linkFormatter ?? defaultLinkFormatter;
    const typeFormatter = options.typeFormatter ?? defaultTypeFormatter;

    const optionality = property.optional
      ? 'Optional'
      : 'Required';

    const md = new Markdown({
      id: anchorFormatter(property.id),
      header: {
        title: property.fqn.split('.').pop(),
        sup: optionality,
        pre: true,
        strike: property.docs.deprecated,
      },
    });

    if (property.docs.deprecated) {
      md.bullet(
        `${Markdown.italic('Deprecated:')} ${property.docs.deprecationReason}`,
      );
      md.lines('');
    }

    if (property.usage) {
      md.code(options.language.toString(), property.usage);
    }

    const metadata: Record<string, string> = { Type: typeFormatter(property.type, linkFormatter) };

    if (property.default) {
      metadata.Default = Markdown.sanitize(property.default);
    }

    for (const [key, value] of Object.entries(metadata)) {
      md.bullet(`${Markdown.italic(`${key}:`)} ${value}`);
    }
    md.lines('');

    if (property.docs) {
      md.docs(property.docs);
    }

    md.split();

    return md;
  }

  private readonly transpiled: TranspiledProperty;
  constructor(
    transpile: Transpile,
    private readonly property: reflect.Property,
  ) {
    this.transpiled = transpile.property(property);
  }

  public toJson(): PropertySchema {
    return {
      fqn: `${this.transpiled.parentType.fqn}.property.${this.transpiled.name}`,
      id: `${this.property.definingType.fqn}.property.${this.property.name}`,
      optional: this.transpiled.optional === true ? true : undefined, // to save space
      default: this.property.spec.docs?.default,
      type: this.transpiled.typeReference.toJson(),
      docs: extractDocs(this.property.docs),
      usage: this.transpiled.declaration,
    };
  }
}
