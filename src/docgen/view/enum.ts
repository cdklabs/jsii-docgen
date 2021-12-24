import * as reflect from 'jsii-reflect';
import { defaultLinkFormatter, Markdown } from '../render/markdown';
import { EnumSchema } from '../schema';
import { Transpile, TranspiledEnum } from '../transpile/transpile';
import { extractDocs } from '../util';
import { MarkdownRenderOptions } from './documentation';
import { EnumMember } from './enum-member';

export class Enum {
  public static toMarkdown(
    enu: EnumSchema,
    options: MarkdownRenderOptions,
  ): Markdown {
    const md = new Markdown({ header: { title: enu.fqn.split('.').pop() }, id: enu.id });

    const linkFormatter = options.linkFormatter ?? defaultLinkFormatter;

    const tableRows: string[][] = [];
    tableRows.push(['Name', 'Description'].map(Markdown.bold));

    for (const em of enu.members) {
      const emLink = Markdown.pre(linkFormatter(em.fqn.split('.').pop()!, em.id));
      const emDescription = em.docs?.summary && em.docs?.summary.length > 0
        ? em.docs?.summary
        : Markdown.italic('No description.');
      tableRows.push([emLink, emDescription]);
    }
    md.table(tableRows);
    md.split();

    if (enu.docs) {
      md.docs(enu.docs);
    }

    for (const em of enu.members) {
      md.section(EnumMember.toMarkdown(em, options));
    }

    return md;
  }

  private readonly transpiled: TranspiledEnum;
  private readonly members: EnumMember[];
  constructor(
    private readonly transpile: Transpile,
    private readonly enu: reflect.EnumType,
  ) {
    this.transpiled = this.transpile.enum(this.enu);
    this.members = enu.members.map((em) => new EnumMember(transpile, em));
  }

  public toJson(): EnumSchema {
    return {
      fqn: this.transpiled.fqn,
      id: this.enu.fqn,
      members: this.members.map((em) => em.toJson()),
      docs: extractDocs(this.enu.docs),
    };
  }
}
