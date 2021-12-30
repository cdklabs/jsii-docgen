import * as reflect from 'jsii-reflect';
import { defaultAnchorFormatter, Markdown } from '../render/markdown';
import { EnumMemberSchema } from '../schema';
import { Transpile, TranspiledEnumMember } from '../transpile/transpile';
import { extractDocs } from '../util';
import { MarkdownRenderContext } from './documentation';

export class EnumMember {
  public static toMarkdown(
    em: EnumMemberSchema,
    context: MarkdownRenderContext,
  ): Markdown {
    const anchorFormatter = context.anchorFormatter ?? defaultAnchorFormatter;

    const md = new Markdown({
      id: anchorFormatter({
        id: em.id,
        fqn: em.fqn,
        packageName: context.packageName,
        packageVersion: context.packageVersion,
        submodule: context.submodule,
      }),
      header: {
        title: em.fqn.split('.').pop(),
        pre: true,
        strike: em.docs.deprecated,
      },
    });

    if (em.docs.deprecated) {
      md.bullet(
        `${Markdown.italic('Deprecated:')} ${em.docs.deprecationReason}`,
      );
      md.lines('');
    }

    if (em.docs) {
      md.docs(em.docs);
    }

    md.split();
    md.lines('');

    return md;
  }

  private readonly transpiled: TranspiledEnumMember;
  constructor(transpile: Transpile, private readonly em: reflect.EnumMember) {
    this.transpiled = transpile.enumMember(em);
  }

  public toJson(): EnumMemberSchema {
    return {
      id: `${this.em.enumType.fqn}.${this.em.name}`,
      fqn: this.transpiled.fqn,
      docs: extractDocs(this.em.docs),
    };
  }
}
