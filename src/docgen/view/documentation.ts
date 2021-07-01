import * as reflect from 'jsii-reflect';
import { Markdown } from '../render/markdown';
import { PythonTranspile } from '../transpile/python';
import { Transpile } from '../transpile/transpile';
import { TypeScriptTranspile } from '../transpile/typescript';
import { ApiReference } from './api-reference';
import { Readme } from './readme';

/**
 * Options for rendering documentation pages.
 */
export interface DocumentationOptions {
  /**
   * The assembly to generate from.
   */
  readonly assembly: reflect.Assembly;

  /**
   * Which language to generate docs for.
   */
  readonly language: string;

  /**
   * Include a generated api reference in the documentation.
   *
   * @default true
   */
  readonly apiReference?: boolean;

  /**
   * Include the user defined README.md in the documentation.
   *
   * @default true
   */
  readonly readme?: boolean;

  /**
   * Generate documentation only for a specific submodule.
   *
   * @default - Documentation is generated for all submodules.
   */
  readonly submoduleName?: string;
}

/**
 * Render documentation pages for a jsii library.
 */
export class Documentation {
  private readonly assembly: reflect.Assembly;
  private readonly submodule?: reflect.Submodule;

  private readonly includeReadme: boolean;
  private readonly includeApiReference: boolean;

  private readonly transpile: Transpile;

  constructor(options: DocumentationOptions) {
    this.assembly = options.assembly;

    switch (options.language) {
      case 'python':
        this.transpile = new PythonTranspile();
        break;
      case 'ts':
        this.transpile = new TypeScriptTranspile();
        break;
      default:
        throw new Error(
          `Generating documentation for ${options.language} is not supported`,
        );
    }

    if (options.submoduleName) {
      this.submodule = this.findSubmodule(options.submoduleName);
    }

    this.includeApiReference = options.apiReference ?? true;
    this.includeReadme = options.readme ?? true;
  }

  /**
   * Generate markdown.
   */
  public render(): Markdown {
    const documentation = new Markdown();

    if (this.includeReadme) {
      const readme = new Readme(this.transpile, this.assembly, this.submodule);
      documentation.section(readme.render());
    }
    if (this.includeApiReference) {
      const apiReference = new ApiReference(
        this.transpile,
        this.assembly,
        this.submodule,
      );
      documentation.section(apiReference.render());
    }

    return documentation;
  }

  /**
   * Lookup a submodule by a submodule name given by the caller.
   */
  private findSubmodule(submoduleName: string): reflect.Submodule {
    const submodules = this.assembly.submodules.filter(
      (s) => s.name === submoduleName,
    );

    if (submodules.length === 0) {
      throw new Error(`Submodule ${submoduleName} not found`);
    }

    if (submodules.length > 1) {
      throw new Error(`Found multiple submodules with name: ${submoduleName}`);
    }

    return submodules[0];
  }
}
