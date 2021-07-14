import * as reflect from 'jsii-reflect';
import { Markdown } from '../render/markdown';
import { StructJson } from '../schema';
import { Transpile, TranspiledStruct, TranspiledType } from '../transpile/transpile';
import { Property } from './property';

export class Struct {
  private readonly transpiled: TranspiledStruct;
  private readonly properties: Property[] = new Array<Property>();
  constructor(
    private readonly transpile: Transpile,
    private readonly iface: reflect.InterfaceType,
    linkFormatter: (type: TranspiledType) => string,
  ) {
    this.transpiled = transpile.struct(iface);
    for (const property of this.iface.allProperties) {
      this.properties.push(new Property(this.transpile, property, linkFormatter));
    }
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

    for (const property of this.properties) {
      initializer.section(property.render());
    }

    md.section(initializer);
    return md;
  }

  public renderToJson(): StructJson {
    const initializer = new Markdown();
    initializer.code(
      this.transpile.language.toString(),
      `${this.transpiled.import}`,
      '',
      `${this.transpiled.initialization}`,
    );

    return {
      id: this.transpiled.type.fqn,
      name: this.transpiled.name,
      docs: this.iface.docs.toString(),
      initializer: initializer.render(),
      properties: this.properties.map((property) => property.renderToJson()),
    };
  }
}
