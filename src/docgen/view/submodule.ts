import * as reflect from 'jsii-reflect';
import { SubmoduleSchema } from '../schema';
import { Transpile, TranspiledSubmodule } from '../transpile/transpile';

export class Submodule {
  private readonly transpiled: TranspiledSubmodule;
  constructor(
    transpile: Transpile,
    private readonly submodule: reflect.Submodule,
  ) {
    this.transpiled = transpile.submodule(this.submodule);
  }

  public toJson(): SubmoduleSchema {
    return {
      jsiiId: this.transpiled.jsiiId,
      fqn: this.transpiled.fqn,
      readme: this.transpiled.readme,
    };
  }
}
