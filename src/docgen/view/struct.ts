import * as reflect from 'jsii-reflect';
import { Markdown } from '../render/markdown';
import { Transpile, TranspiledStruct, TranspiledType } from '../transpile/transpile';
import { Properties } from './properties';

export class Struct {
  private readonly transpiled: TranspiledStruct;
  private readonly properties: Properties;
  constructor(
    private readonly transpile: Transpile,
    private readonly iface: reflect.InterfaceType,
    linkFormatter: (type: TranspiledType) => string,
  ) {
    this.transpiled = transpile.struct(iface);
    this.properties = new Properties(transpile, this.iface.allProperties, linkFormatter);
  }

  public render(): Markdown {
    const md = new Markdown({
      id: this.transpiled.type.fqn,
      header: { title: this.transpiled.name },
    });

    if (this.iface.docs) {
      md.docs(this.iface.docs);
    }

    const initializer = new Markdown({
      id: `${this.transpiled.type}.Initializer`,
      header: { title: 'Initializer' },
    });

    initializer.code(
      this.transpile.language.toString(),
      `${this.transpiled.import}`,
      '',
      `${this.transpiled.initialization}`,
    );

    md.section(initializer);
    md.section(this.properties.render());
    return md;
  }
}
