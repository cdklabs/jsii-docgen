import * as reflect from 'jsii-reflect';
import { Class } from './class';
import { ConstructSchema } from '../schema';
import { Transpile } from '../transpile/transpile';

export class Construct {
  private readonly construct: Class;
  constructor(transpile: Transpile, klass: reflect.ClassType) {
    this.construct = new Class(transpile, klass);
  }

  public toJson(): ConstructSchema {
    return this.construct.toJson();
  }
}
