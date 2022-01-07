import * as reflect from 'jsii-reflect';
import { defaultAnchorFormatter, defaultLinkFormatter, defaultTypeFormatter, MarkdownDocument } from '../render/markdown-doc';
import { InitializerSchema } from '../schema';
import { Transpile, TranspiledCallable } from '../transpile/transpile';
import { MarkdownRenderContext } from './documentation';
import { Parameter } from './parameter';

export class Initializer {
  public static toMarkdown(
    init: InitializerSchema,
    context: MarkdownRenderContext,
  ): MarkdownDocument {
    const anchorFormatter = context.anchorFormatter ?? defaultAnchorFormatter;
    const linkFormatter = context.linkFormatter ?? defaultLinkFormatter;
    const typeFormatter = context.typeFormatter ?? defaultTypeFormatter;

    const md = new MarkdownDocument({
      id: anchorFormatter({
        id: init.id,
        displayName: init.displayName,
        fqn: init.fqn,
        packageName: context.packageName,
        packageVersion: context.packageVersion,
        submodule: context.submodule,
      }),
      header: {
        title: 'Initializers',
      },
    });

    if (init.usage) {
      md.code(
        context.language.toString(),
        init.usage,
      );
    }

    const tableRows: string[][] = [];
    tableRows.push(['Name', 'Type', 'Description'].map(MarkdownDocument.bold));
    for (const param of init.parameters) {
      const paramLink = MarkdownDocument.pre(linkFormatter({
        id: param.id,
        displayName: param.displayName,
        fqn: param.fqn,
        packageName: context.packageName,
        packageVersion: context.packageVersion,
        submodule: context.submodule,
      }));
      const paramType = MarkdownDocument.pre(typeFormatter(param.type, linkFormatter));
      const paramDescription = param.docs?.summary && param.docs?.summary.length > 0
        ? param.docs?.summary
        : MarkdownDocument.italic('No description.');
      tableRows.push([paramLink, paramType, paramDescription]);
    }
    md.table(tableRows);
    md.split();

    for (const param of init.parameters) {
      md.section(Parameter.toMarkdown(param, context));
    }

    return md;
  }

  private readonly transpiled: TranspiledCallable;
  private readonly parameters: Parameter[];
  constructor(
    private readonly transpile: Transpile,
    private readonly initializer: reflect.Initializer,
  ) {
    this.transpiled = transpile.callable(initializer);
    this.parameters = this.transpiled.parameters.map(
      (p) => new Parameter(this.transpile, p),
    );
  }

  public toJson(): InitializerSchema {
    return {
      fqn: `${this.transpiled.parentType.fqn}.Initializer`,
      displayName: 'Initializer',
      id: `${this.initializer.parentType.fqn}.Initializer`,
      parameters: this.parameters.map((param) => param.toJson()),
      usage: `${this.transpiled.import}\n\n${this.transpiled.invocations}`,
    };
  }
}
