import * as reflect from 'jsii-reflect';
import { Markdown } from '../render/markdown';
import { EnumSchema } from '../schema';
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

  public toMarkdown(): Markdown {
    const transpiled = this.transpile.enum(this.enu);
    const md = new Markdown({ header: { title: transpiled.name } });

    if (this.enu.docs) {
      md.docs(this.enu.docs);
    }

    for (const m of this.members) {
      md.section(m.toMarkdown());
    }

    return md;
  }

  public toJson(): EnumSchema {
    const transpiled = this.transpile.enum(this.enu);
    return {
      name: transpiled.name,
      docs: this.enu.docs.toString(),
      members: this.members.map((member) => member.toJson()),
    };
  }
}
