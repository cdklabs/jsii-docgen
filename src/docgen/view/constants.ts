import * as reflect from 'jsii-reflect';
import { defaultLinkFormatter, defaultTypeFormatter, Markdown } from '../render/markdown';
import { PropertySchema } from '../schema';
import { Transpile } from '../transpile/transpile';
import { Constant } from './constant';
import { MarkdownRenderOptions } from './documentation';

export class Constants {
  public static toMarkdown(
    constants: PropertySchema[],
    options: MarkdownRenderOptions,
  ): Markdown {
    if (constants.length === 0) {
      return Markdown.EMPTY;
    }

    const md = new Markdown({ header: { title: 'Constants' } });

    const linkFormatter = options.linkFormatter ?? defaultLinkFormatter;
    const typeFormatter = options.typeFormatter ?? defaultTypeFormatter;

    const tableRows: string[][] = [];
    tableRows.push(['Name', 'Type', 'Description'].map(Markdown.bold));
    for (const con of constants) {
      const conLink = Markdown.pre(linkFormatter(con.fqn, con.id));
      const conType = Markdown.pre(typeFormatter(con.type, linkFormatter));
      const conDescription = con.docs?.summary && con.docs?.summary.length > 0
        ? con.docs?.summary
        : Markdown.italic('No description.');
      tableRows.push([conLink, conType, conDescription]);
    }
    md.table(tableRows);
    md.split();

    for (const prop of constants) {
      md.section(Constant.toMarkdown(prop, options));
    }

    return md;
  }

  private readonly constants: Constant[];
  constructor(transpile: Transpile, properties: reflect.Property[]) {
    this.constants = properties
      .filter((p) => !p.protected && p.const)
      .map((p) => new Constant(transpile, p));
  }

  public toJson(): PropertySchema[] {
    return this.constants.map((c) => c.toJson());
  }
}
