import * as reflect from 'jsii-reflect';
import { EnumSchema, extractDocs } from '../schema';
import { Transpile, TranspiledEnum } from '../transpile/transpile';
import { EnumMember } from './enum-member';

export class Enum {
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
      id: this.enu.fqn,
      fqn: this.transpiled.fqn,
      displayName: this.transpiled.fqn.split('.').pop()!,
      members: this.members.map((em) => em.toJson()),
      docs: extractDocs(this.enu.docs),
      location: this.enu.locationInRepository,
      submodule: this.enu.namespace,
    };
  }
}
