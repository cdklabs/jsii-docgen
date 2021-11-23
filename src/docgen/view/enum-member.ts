import * as reflect from 'jsii-reflect';
import { anchorForId, Markdown } from '../render/markdown';
import { Transpile, TranspiledEnumMember } from '../transpile/transpile';

export class EnumMember {
  private readonly transpiled: TranspiledEnumMember;
  constructor(transpile: Transpile, private readonly em: reflect.EnumMember) {
    this.transpiled = transpile.enumMember(em);
  }

  public get id(): string {
    return `${this.transpiled.fqn}`;
  }

  public get linkedName(): string {
    return `[${Markdown.pre(this.transpiled.name)}](#${anchorForId(this.id)})`;
  }

  public get description(): string {
    const summary = this.em.docs.summary;
    return summary.length > 0 ? summary : Markdown.italic('No description.');
  }

  public render(): Markdown {
    const md = new Markdown({
      id: this.id,
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
}
