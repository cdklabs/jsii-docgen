import * as reflect from 'jsii-reflect';
import { defaultLinkFormatter, defaultTypeFormatter, Markdown } from '../render/markdown';
import { InitializerSchema } from '../schema';
import { Transpile, TranspiledCallable } from '../transpile/transpile';
import { MarkdownRenderOptions } from './documentation';
import { Parameter } from './parameter';

export class Initializer {
  public static toMarkdown(
    init: InitializerSchema,
    options: MarkdownRenderOptions,
  ): Markdown {
    const md = new Markdown({
      id: init.id,
      header: {
        title: 'Initializers',
      },
    });

    if (init.usage) {
      md.code(
        options.language.toString(),
        init.usage,
      );
    }

    const linkFormatter = options.linkFormatter ?? defaultLinkFormatter;
    const typeFormatter = options.typeFormatter ?? defaultTypeFormatter;

    const tableRows: string[][] = [];
    tableRows.push(['Name', 'Type', 'Description'].map(Markdown.bold));
    for (const param of init.parameters) {
      const paramLink = Markdown.pre(linkFormatter(param.fqn.split('.').pop()!, param.id));
      const paramType = Markdown.pre(typeFormatter(param.type, linkFormatter));
      const paramDescription = param.docs?.summary && param.docs?.summary.length > 0
        ? param.docs?.summary
        : Markdown.italic('No description.');
      tableRows.push([paramLink, paramType, paramDescription]);
    }
    md.table(tableRows);
    md.split();

    for (const param of init.parameters) {
      md.section(Parameter.toMarkdown(param, options));
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
