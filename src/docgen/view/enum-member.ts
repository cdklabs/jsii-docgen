import * as reflect from 'jsii-reflect';
import { Markdown } from '../render/markdown';
import { EnumMemberJson } from '../schema';
import { Transpile, TranspiledEnumMember } from '../transpile/transpile';

export class EnumMember {
  private readonly transpiled: TranspiledEnumMember;
  constructor(transpile: Transpile, private readonly em: reflect.EnumMember) {
    this.transpiled = transpile.enumMember(em);
  }
  public render(): Markdown {
    const md = new Markdown({
      id: `${this.transpiled.fqn}`,
      header: {
        title: this.transpiled.name,
        pre: true,
        strike: this.em.docs.deprecated,
      },
    });

    if (this.em.docs.deprecated) {
      md.bullet(
        `${Markdown.italic('Deprecated:')} ${this.em.docs.deprecationReason}`,
      );
      md.lines('');
    }

    if (this.em.docs) {
      md.docs(this.em.docs);
    }

    md.split();
    md.lines('');

    return md;
  }

  public renderToJson(): EnumMemberJson {
    return {
      id: this.transpiled.fqn,
      name: this.transpiled.name,
      deprecated: this.em.docs.deprecated,
      deprecationReason: this.em.docs.deprecationReason,
      docs: this.em.docs.toString(),
    };
  }
}
