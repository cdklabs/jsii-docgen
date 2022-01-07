import * as reflect from 'jsii-reflect';
import { defaultAnchorFormatter, defaultLinkFormatter, defaultTypeFormatter, Markdown } from '../render/markdown';
import { PropertySchema } from '../schema';
import { Transpile, TranspiledProperty } from '../transpile/transpile';
import { extractDocs } from '../util';
import { MarkdownRenderContext } from './documentation';

export class Property {
  public static toMarkdown(
    prop: PropertySchema,
    context: MarkdownRenderContext,
  ): Markdown {
    const anchorFormatter = context.anchorFormatter ?? defaultAnchorFormatter;
    const linkFormatter = context.linkFormatter ?? defaultLinkFormatter;
    const typeFormatter = context.typeFormatter ?? defaultTypeFormatter;

    const optionality = prop.optional
      ? 'Optional'
      : 'Required';

    const md = new Markdown({
      id: anchorFormatter({
        id: prop.id,
        displayName: prop.displayName,
        fqn: prop.fqn,
        packageName: context.packageName,
        packageVersion: context.packageVersion,
        submodule: context.submodule,
      }),
      header: {
        title: prop.fqn.split('.').pop(),
        sup: optionality,
        pre: true,
        strike: prop.docs.deprecated,
      },
    });

    if (prop.docs.deprecated) {
      md.bullet(
        `${Markdown.italic('Deprecated:')} ${prop.docs.deprecationReason}`,
      );
      md.lines('');
    }

    if (prop.usage) {
      md.code(context.language.toString(), prop.usage);
    }

    const metadata: Record<string, string> = { Type: typeFormatter(prop.type, linkFormatter) };

    if (prop.default) {
      metadata.Default = Markdown.sanitize(prop.default);
    }

    for (const [key, value] of Object.entries(metadata)) {
      md.bullet(`${Markdown.italic(`${key}:`)} ${value}`);
    }
    md.lines('');

    if (prop.docs) {
      md.docs(prop.docs);
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
      displayName: this.transpiled.name,
      id: `${this.transpiled.parentType.source.fqn}.property.${this.property.name}`,
      optional: this.transpiled.optional === true ? true : undefined, // to save space
      default: this.property.spec.docs?.default,
      type: this.transpiled.typeReference.toJson(),
      docs: extractDocs(this.property.docs),
      usage: this.transpiled.declaration,
    };
  }
}
