import * as reflect from 'jsii-reflect';
import { Markdown } from '../render/markdown';
import { ApiReferenceJson } from '../schema';
import { Transpile, TranspiledType } from '../transpile/transpile';
import { Classes } from './classes';
import { Constructs } from './constructs';
import { Enums } from './enums';
import { Interfaces } from './interfaces';
import { Structs } from './structs';

/**
 * Render an API reference based on the jsii assembly.
 */
export class ApiReference {
  private readonly constructs: Constructs;
  private readonly structs: Structs;
  private readonly interfaces: Interfaces;
  private readonly classes: Classes;
  private readonly enums: Enums;
  constructor(
    transpile: Transpile,
    assembly: reflect.Assembly,
    linkFormatter: (type: TranspiledType) => string,
    submodule?: reflect.Submodule,
  ) {
    const classes = this.sortByName(
      submodule ? submodule.classes : assembly.classes,
    );
    const interfaces = this.sortByName(
      submodule ? submodule.interfaces : assembly.interfaces,
    );
    const enums = this.sortByName(submodule ? submodule.enums : assembly.enums);

    this.constructs = new Constructs(transpile, classes, linkFormatter);
    this.classes = new Classes(transpile, classes, linkFormatter);
    this.structs = new Structs(transpile, interfaces, linkFormatter);
    this.interfaces = new Interfaces(transpile, interfaces, linkFormatter);
    this.enums = new Enums(transpile, enums);
  }

  /**
   * Generate markdown.
   */
  public render(): Markdown {
    const md = new Markdown({ header: { title: 'API Reference' } });
    md.section(this.constructs.render());
    md.section(this.structs.render());
    md.section(this.classes.render());
    md.section(this.interfaces.render());
    md.section(this.enums.render());
    return md;
  }

  public renderToJson(): ApiReferenceJson {
    return {
      constructs: this.constructs.renderToJson(),
      classes: this.classes.renderToJson(),
      structs: this.structs.renderToJson(),
      interfaces: this.interfaces.renderToJson(),
      enums: this.enums.renderToJson(),
    };
  }

  private sortByName<Type extends reflect.Type>(arr: readonly Type[]): Type[] {
    return [...arr].sort((s1, s2) => s1.name.localeCompare(s2.name));
  }
}
