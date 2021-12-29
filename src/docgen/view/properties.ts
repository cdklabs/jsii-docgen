import * as reflect from 'jsii-reflect';
import { defaultLinkFormatter, defaultTypeFormatter, Markdown } from '../render/markdown';
import { PropertySchema } from '../schema';
import { Transpile } from '../transpile/transpile';
import { MarkdownRenderOptions } from './documentation';
import { Property } from './property';

export class Properties {
  public static toMarkdown(
    properties: PropertySchema[],
    options: MarkdownRenderOptions,
  ): Markdown {
    if (properties.length === 0) {
      return Markdown.EMPTY;
    }

    const md = new Markdown({ header: { title: 'Properties' } });

    const linkFormatter = options.linkFormatter ?? defaultLinkFormatter;
    const typeFormatter = options.typeFormatter ?? defaultTypeFormatter;

    const tableRows: string[][] = [];
    tableRows.push(['Name', 'Type', 'Description'].map(Markdown.bold));
    for (const prop of properties) {
      const propLink = Markdown.pre(linkFormatter(prop.fqn, prop.id));
      const propType = Markdown.pre(typeFormatter(prop.type, linkFormatter));
      const propDescription = prop.docs?.summary && prop.docs?.summary.length > 0
        ? prop.docs?.summary
        : Markdown.italic('No description.');
      tableRows.push([propLink, propType, propDescription]);
    }
    md.table(tableRows);
    md.split();

    for (const prop of properties) {
      md.section(Property.toMarkdown(prop, options));
    }

    return md;
  }

  private readonly properties: Property[];
  constructor(transpile: Transpile, properties: reflect.Property[]) {
    this.properties = properties
      .filter((p) => !p.protected && !p.const)
      .map((p) => new Property(transpile, p));
  }

  public toJson(): PropertySchema[] {
    return this.properties.map((p) => p.toJson());
  }
}
