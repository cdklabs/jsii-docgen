import * as reflect from 'jsii-reflect';
import { SubmoduleSchema } from '../schema';
import { Transpile } from '../transpile/transpile';
import { Submodule } from './submodule';

export class Submodules {
  private readonly submodules: Submodule[];
  constructor(transpile: Transpile, submodules: reflect.Submodule[]) {
    this.submodules = submodules.map((i) => new Submodule(transpile, i));
  }

  public toJson(): SubmoduleSchema[] {
    return this.submodules.map((s) => s.toJson());
  }
}
