import * as jsiiReflect from 'jsii-reflect';
import { Page, RenderContext } from './page';

export class Home extends Page {
  constructor(ctx: RenderContext, private readonly assembly: jsiiReflect.Assembly) {
    super(ctx, assembly);
  }

  public render() {
    const self = this;
    const assembly = this.assembly;
    const lines = new Array<string>();

    if (this.ctx.readme ?? true) {
      const readme = assembly.readme?.markdown;
      if (readme) {
        lines.push(readme);
      }

      lines.push('## API Reference');
    } else {
      lines.push('# API Reference');
    }

    addSection('Classes', assembly.classes);
    addSection('Structs', assembly.interfaces.filter(i => i.isDataType()));
    addSection('Interfaces', assembly.interfaces.filter(i => !i.isDataType()));
    addSection('Enums', assembly.enums);

    return lines;

    function addSection(title: string, collection: readonly jsiiReflect.Type[]) {
      if (collection.length === 0) {
        return;
      }

      lines.push('');
      lines.push(`**${title}**`);
      lines.push('');
      lines.push('Name|Description');
      lines.push('----|-----------');

      for (const type of collection) {
        lines.push(`${self.typeLink(type)}|${type.docs.summary.trim() || '*No description*'}`);
      }

      lines.push('');
    }
  }
}
