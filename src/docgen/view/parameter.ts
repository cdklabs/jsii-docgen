import * as reflect from 'jsii-reflect';
import { defaultLinkFormatter, defaultTypeFormatter, Markdown } from '../render/markdown';
import { ParameterSchema } from '../schema';
import { Transpile, TranspiledParameter } from '../transpile/transpile';
import { extractDocs } from '../util';
import { MarkdownRenderOptions } from './documentation';

export class Parameter {
  public static toMarkdown(
    parameter: ParameterSchema,
    options: MarkdownRenderOptions,
  ): Markdown {
    const optionality = parameter.optional ? 'Optional' : 'Required';

    const md = new Markdown({
      id: parameter.id,
      header: {
        title: parameter.fqn.split('.').pop(),
        sup: optionality,
        pre: true,
        strike: parameter.docs.deprecated,
      },
    });

    if (parameter.docs.deprecated) {
      md.bullet(
        `${Markdown.italic('Deprecated:')} ${parameter.docs.deprecationReason}`,
      );
      md.lines('');
    }

    const linkFormatter = options.linkFormatter ?? defaultLinkFormatter;
    const typeFormatter = options.typeFormatter ?? defaultTypeFormatter;

    const metadata: any = { Type: typeFormatter(parameter.type, linkFormatter) };

    if (parameter.default) {
      metadata.Default = Markdown.sanitize(parameter.default);
    }

    for (const [key, value] of Object.entries(metadata)) {
      md.bullet(`${Markdown.italic(`${key}:`)} ${value}`);
    }
    md.lines('');

    if (parameter.docs) {
      md.docs(parameter.docs);
    }

    md.split();

    return md;
  }

  private readonly transpiled: TranspiledParameter;
  constructor(
    transpile: Transpile,
    private readonly parameter: reflect.Parameter,
  ) {
    this.transpiled = transpile.parameter(parameter);
  }

  public toJson(): ParameterSchema {
    return {
      fqn: `${this.transpiled.parentType.fqn}.parameter.${this.transpiled.name}`,
      id: `${this.parameter.parentType.fqn}.parameter.${this.parameter.name}`,
      optional: this.transpiled.optional === true ? true : undefined, // to save space
      default: this.parameter.spec.docs?.default,
      type: this.transpiled.typeReference.toJson(),
      docs: extractDocs(this.parameter.docs),
    };
  }
}
