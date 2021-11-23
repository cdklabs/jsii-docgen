import * as reflect from 'jsii-reflect';
import { Markdown } from '../render/markdown';
import { Transpile, TranspiledType } from '../transpile/transpile';
import { Property } from './property';

export class Properties {
  private readonly properties: Property[];
  constructor(transpile: Transpile, properties: reflect.Property[], linkFormatter: (type: TranspiledType) => string) {
    this.properties = properties
      .filter((p) => !p.protected && !p.const)
      .map((p) => new Property(transpile, p, linkFormatter));
  }

  public render(): Markdown {
    if (this.properties.length === 0) {
      return Markdown.EMPTY;
    }

    const md = new Markdown({ header: { title: 'Properties' } });

    md.table([
      ['Name', 'Type', 'Description'].map(Markdown.bold),
      ...this.properties.map((prop) => [prop.name, prop.type, Markdown.sanitize(prop.description)]),
    ]);
    md.split();

    for (const property of this.properties) {
      md.section(property.render());
    }

    return md;
  }
}
