import * as reflect from 'jsii-reflect';
import { defaultAnchorFormatter, defaultLinkFormatter, MarkdownDocument } from '../render/markdown-doc';
import { EnumSchema } from '../schema';
import { Transpile, TranspiledEnum } from '../transpile/transpile';
import { extractDocs } from '../util';
import { MarkdownRenderContext } from './documentation';
import { EnumMember } from './enum-member';

export class Enum {
  public static toMarkdown(
    enu: EnumSchema,
    context: MarkdownRenderContext,
  ): MarkdownDocument {
    const anchorFormatter = context.anchorFormatter ?? defaultAnchorFormatter;
    const linkFormatter = context.linkFormatter ?? defaultLinkFormatter;

    const md = new MarkdownDocument({
      id: anchorFormatter({
        id: enu.id,
        displayName: enu.displayName,
        fqn: enu.fqn,
        packageName: context.packageName,
        packageVersion: context.packageVersion,
        submodule: context.submodule,
      }),
      header: { title: enu.fqn.split('.').pop() },
    });

    const tableRows: string[][] = [];
    tableRows.push(['Name', 'Description'].map(MarkdownDocument.bold));

    for (const em of enu.members) {
      const emLink = MarkdownDocument.pre(linkFormatter({
        fqn: em.fqn,
        displayName: em.displayName,
        id: em.id,
        packageName: context.packageName,
        packageVersion: context.packageVersion,
        submodule: context.submodule,
      }));
      const emDescription = em.docs?.summary && em.docs?.summary.length > 0
        ? em.docs?.summary
        : MarkdownDocument.italic('No description.');
      tableRows.push([emLink, emDescription]);
    }
    md.table(tableRows);
    md.split();

    if (enu.docs) {
      md.docs(enu.docs);
    }

    for (const em of enu.members) {
      md.section(EnumMember.toMarkdown(em, context));
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
      displayName: this.transpiled.fqn.split('.').pop()!,
      id: this.enu.fqn,
      members: this.members.map((em) => em.toJson()),
      docs: extractDocs(this.enu.docs),
    };
  }
}
