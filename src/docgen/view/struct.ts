import * as reflect from 'jsii-reflect';
import { extractDocs, StructSchema } from '../schema';
import { Transpile, TranspiledStruct } from '../transpile/transpile';
import { Properties } from './properties';

export class Struct {
  private readonly transpiled: TranspiledStruct;
  private readonly properties: Properties;
  constructor(
    transpile: Transpile,
    private readonly iface: reflect.InterfaceType,
  ) {
    this.transpiled = transpile.struct(iface);
    this.properties = new Properties(transpile, this.iface.allProperties);
  }

  public toJson(): StructSchema {
    return {
      jsiiId: this.iface.fqn,
      fqn: this.transpiled.type.fqn,
      displayName: this.transpiled.type.fqn.split('.').pop()!,
      properties: this.properties.toJson(),
      docs: extractDocs(this.iface.docs),
      usage: `${this.transpiled.import}\n\n${this.transpiled.initialization}`,
      submoduleJsiiId: this.transpiled.type.submoduleJsiiId,
      submoduleFqn: this.transpiled.type.submoduleFqn,
      sourceFile: this.transpiled.type.source.locationInModule?.filename,
      sourceLine: this.transpiled.type.source.locationInModule?.line,
    };
  }
}
