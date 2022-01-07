import * as reflect from 'jsii-reflect';
import { defaultAnchorFormatter, defaultLinkFormatter, defaultTypeFormatter, MarkdownDocument } from '../render/markdown-doc';
import { ParameterSchema } from '../schema';
import { Transpile, TranspiledParameter } from '../transpile/transpile';
import { extractDocs } from '../util';
import { MarkdownRenderContext } from './documentation';

export class Parameter {
  public static toMarkdown(
    parameter: ParameterSchema,
    context: MarkdownRenderContext,
  ): MarkdownDocument {
    const anchorFormatter = context.anchorFormatter ?? defaultAnchorFormatter;
    const linkFormatter = context.linkFormatter ?? defaultLinkFormatter;
    const typeFormatter = context.typeFormatter ?? defaultTypeFormatter;

    const optionality = parameter.optional ? 'Optional' : 'Required';

    const md = new MarkdownDocument({
      id: anchorFormatter({
        id: parameter.id,
        displayName: parameter.displayName,
        fqn: parameter.fqn,
        packageName: context.packageName,
        packageVersion: context.packageVersion,
        submodule: context.submodule,
      }),
      header: {
        title: parameter.fqn.split('.').pop(),
        sup: optionality,
        pre: true,
        strike: parameter.docs.deprecated,
      },
    });

    if (parameter.docs.deprecated) {
      md.bullet(
        `${MarkdownDocument.italic('Deprecated:')} ${parameter.docs.deprecationReason}`,
      );
      md.lines('');
    }


    const metadata: any = { Type: typeFormatter(parameter.type, linkFormatter) };

    if (parameter.default) {
      metadata.Default = MarkdownDocument.sanitize(parameter.default);
    }

    for (const [key, value] of Object.entries(metadata)) {
      md.bullet(`${MarkdownDocument.italic(`${key}:`)} ${value}`);
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
      displayName: this.transpiled.name,
      id: `${this.parameter.parentType.fqn}.parameter.${this.parameter.name}`,
      optional: this.transpiled.optional === true ? true : undefined, // to save space
      default: this.parameter.spec.docs?.default,
      type: this.transpiled.typeReference.toJson(),
      docs: extractDocs(this.parameter.docs),
    };
  }
}
