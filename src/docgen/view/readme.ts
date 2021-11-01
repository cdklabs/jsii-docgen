import * as reflect from 'jsii-reflect';
import { Markdown } from '../render/markdown';
import { Transpile } from '../transpile/transpile';

/**
 * Render the user defined readme of a jsii library.
 */
export class Readme {
  private readonly readme?: string;

  constructor(
    transpile: Transpile,
    assembly: reflect.Assembly,
    submodule?: reflect.Submodule,
  ) {
    const readme = submodule ? submodule.readme : assembly.readme;
    this.readme = readme ? transpile.readme(readme.markdown) : undefined;
  }

  /**
   * Generate markdown.
   */
  public toMarkdown(): Markdown {
    if (!this.readme) {
      return Markdown.EMPTY;
    }

    const md = new Markdown();
    if (this.readme) {
      md.lines(this.readme);
    }
    return md;
  }
}
