import * as reflect from 'jsii-reflect';
import { EnumMemberSchema, extractDocs } from '../schema';
import { Transpile, TranspiledEnumMember } from '../transpile/transpile';

export class EnumMember {
  private readonly transpiled: TranspiledEnumMember;
  constructor(transpile: Transpile, private readonly em: reflect.EnumMember) {
    this.transpiled = transpile.enumMember(em);
  }

  public toJson(): EnumMemberSchema {
    return {
      jsiiId: `${this.em.enumType.fqn}.${this.em.name}`,
      displayName: this.transpiled.name,
      fqn: this.transpiled.fqn,
      docs: extractDocs(this.em.docs),
      submoduleJsiiId: this.transpiled.type.submoduleJsiiId,
      submoduleFqn: this.transpiled.type.submoduleFqn,
      sourceFile: this.transpiled.type.source.locationInModule?.filename,
      sourceLine: this.transpiled.type.source.locationInModule?.line,
    };
  }
}
