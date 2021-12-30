import * as reflect from 'jsii-reflect';
import { defaultAnchorFormatter, defaultLinkFormatter, defaultTypeFormatter, Markdown } from '../render/markdown';
import { InitializerSchema } from '../schema';
import { Transpile, TranspiledCallable } from '../transpile/transpile';
import { MarkdownRenderContext } from './documentation';
import { Parameter } from './parameter';

export class Initializer {
  public static toMarkdown(
    init: InitializerSchema,
    context: MarkdownRenderContext,
  ): Markdown {
    const anchorFormatter = context.anchorFormatter ?? defaultAnchorFormatter;
    const linkFormatter = context.linkFormatter ?? defaultLinkFormatter;
    const typeFormatter = context.typeFormatter ?? defaultTypeFormatter;

    const md = new Markdown({
      id: anchorFormatter({
        id: init.id,
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
    tableRows.push(['Name', 'Type', 'Description'].map(Markdown.bold));
    for (const param of init.parameters) {
      const paramLink = Markdown.pre(linkFormatter({
        id: param.id,
        fqn: param.fqn,
        packageName: context.packageName,
        packageVersion: context.packageVersion,
        submodule: context.submodule,
      }));
      const paramType = Markdown.pre(typeFormatter(param.type, linkFormatter));
      const paramDescription = param.docs?.summary && param.docs?.summary.length > 0
        ? param.docs?.summary
        : Markdown.italic('No description.');
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
      id: `${this.initializer.parentType.fqn}.Initializer`,
      parameters: this.parameters.map((param) => param.toJson()),
      usage: `${this.transpiled.import}\n\n${this.transpiled.invocations}`,
    };
  }
}
