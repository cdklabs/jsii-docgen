import * as reflect from 'jsii-reflect';
import { Markdown } from '../render/markdown';
import { Transpile } from '../transpile/transpile';
import { EnumMember } from './enum-member';

export class Enum {
  private readonly members: EnumMember[];
  constructor(
    private readonly transpile: Transpile,
    private readonly enu: reflect.EnumType,
  ) {
    this.members = enu.members.map((em) => new EnumMember(transpile, em));
  }

  public render(): Markdown {
    const transpiled = this.transpile.enum(this.enu);
    const md = new Markdown({ header: { title: transpiled.name } });

    md.table([
      ['Name', 'Description'].map(Markdown.bold),
      ...this.members.map((member) => [member.linkedName, Markdown.sanitize(member.description)]),
    ]);
    md.split();

    if (this.enu.docs) {
      md.docs(this.enu.docs);
    }

    for (const m of this.members) {
      md.section(m.render());
    }

    return md;
  }
}
