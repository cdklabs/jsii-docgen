import * as reflect from 'jsii-reflect';
import { Markdown } from '../render/markdown';
import { StructSchema } from '../schema';
import { Transpile, TranspiledStruct } from '../transpile/transpile';
import { extractDocs } from '../util';
import { MarkdownRenderOptions } from './documentation';
import { Properties } from './properties';

export class Struct {
  public static toMarkdown(
    struct: StructSchema,
    options: MarkdownRenderOptions,
  ): Markdown {
    const md = new Markdown({
      id: struct.id,
      header: { title: struct.fqn.split('.').pop() },
    });

    if (struct.docs) {
      md.docs(struct.docs);
    }

    const initializer = new Markdown({
      id: `${struct.id}.Initializer`,
      header: { title: 'Initializer' },
    });

    if (struct.usage) {
      initializer.code(
        options.language.toString(),
        struct.usage,
      );
    }

    md.section(initializer);
    md.section(Properties.toMarkdown(struct.properties, options));
    return md;
  }

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
      fqn: `${this.transpiled.type.fqn}`,
      id: this.iface.fqn,
      properties: this.properties.toJson(),
      docs: extractDocs(this.iface.docs),
      usage: `${this.transpiled.import}\n\n${this.transpiled.initialization}`,
    };
  }
}
