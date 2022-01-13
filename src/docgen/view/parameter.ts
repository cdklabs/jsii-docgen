import * as reflect from 'jsii-reflect';
import { extractDocs, ParameterSchema } from '../schema';
import { Transpile, TranspiledParameter } from '../transpile/transpile';

export class Parameter {
  private readonly transpiled: TranspiledParameter;
  constructor(
    transpile: Transpile,
    private readonly parameter: reflect.Parameter,
  ) {
    this.transpiled = transpile.parameter(parameter);
  }

  public toJson(): ParameterSchema {
    return {
      fqn: `${this.transpiled.parentType.fqn}.parameter.${this.transpiled.name}`,
      displayName: this.transpiled.name,
      id: `${this.parameter.parentType.fqn}.parameter.${this.parameter.name}`,
      optional: this.transpiled.optional === true ? true : undefined, // to save space
      default: this.parameter.spec.docs?.default,
      type: this.transpiled.typeReference.toJson(),
      docs: extractDocs(this.parameter.docs),
    };
  }
}
