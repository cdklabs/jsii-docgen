import * as reflect from 'jsii-reflect';
import { extractDocs, ParameterSchema } from '../schema';
import { Transpile, TranspiledCallable, TranspiledParameter } from '../transpile/transpile';

export class Parameter {
  private readonly transpiledParam: TranspiledParameter;
  private readonly transpiledCallable: TranspiledCallable;
  constructor(
    private readonly transpile: Transpile,
    private readonly parameter: reflect.Parameter,
  ) {
    this.transpiledParam = transpile.parameter(parameter);
    this.transpiledCallable = transpile.callable(parameter.method);
  }

  public toJson(): ParameterSchema {
    let typeschema = this.transpiledParam.typeReference.toJson();
    // If the parameter is variadic, then we have to change the formatting pattern of the type schema.
    // For example, if the formatting pattern for a string type is 'string', we'd make it variadic by
    // changing it to '...string[]' in Typescript - each language has its own variadic syntax which is defined
    // in the `variadicOf()` function.
    //
    // Another example: let's say we have a Python function that takes a single number parameter like so: 'number: int'
    // To make this variadic, we'd change it to '*number: int' -- here, the formatting pattern needs to be updated to prepend
    // the '*' character to indicate the parameter is variadic.
    if (this.transpiledParam.variadic) {
      typeschema = {
        formattingPattern: this.transpile.variadicOf(typeschema.formattingPattern),
        types: typeschema.types,
      };
    }
    const isInitializer = this.parameter.method.kind === reflect.MemberKind.Initializer;
    const methodName = isInitializer ? 'Initializer' : this.transpiledCallable.name;
    const methodId = isInitializer ? 'Initializer' : this.parameter.method.name;
    return {
      fqn: `${this.transpiledParam.parentType.fqn}.${methodName}.parameter.${this.transpiledParam.name}`,
      displayName: this.transpiledParam.name,
      id: `${this.parameter.parentType.fqn}.${methodId}.parameter.${this.parameter.name}`,
      optional: this.transpiledParam.optional === true ? true : undefined, // to save space
      default: this.parameter.spec.docs?.default,
      type: typeschema,
      variadic: this.transpiledParam.variadic,
      docs: extractDocs(this.parameter.docs),
    };
  }
}
