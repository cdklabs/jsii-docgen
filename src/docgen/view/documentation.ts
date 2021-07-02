import * as child from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as glob from 'glob';
import * as reflect from 'jsii-reflect';
import { TargetLanguage } from 'jsii-rosetta';
import { transliterateAssembly } from 'jsii-rosetta/lib/commands/transliterate';
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
   * Which language to generate docs for.
   *
   * @default 'ts'
   */
  readonly language?: 'ts' | 'python';

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
   * @default - Documentation is generated for the root module only.
   */
  readonly submodule?: string;
}

/**
 * Render documentation pages for a jsii library.
 */
export class Documentation {

  public static async forRemotePackage(name: string, version: string, options?: DocumentationOptions): Promise<Documentation> {

    const workdir = fs.mkdtempSync(path.join(os.tmpdir(), path.sep));

    // we need npm7 so that it brings peer dependencies on install
    child.execSync('npm install npm@7', {
      cwd: workdir,
      env: {
        ...process.env,
        HOME: os.tmpdir(), // npm fails with EROFS if $HOME is read-only, event if it won't write there
      },
    });

    // now install the package
    child.execSync(`${workdir}/node_modules/.bin/npm install --ignore-scripts --no-bin-links --no-save ${name}@${version}`, {
      cwd: workdir,
      env: {
        ...process.env,
        HOME: os.tmpdir(), // npm fails with EROFS if $HOME is read-only, event if it won't write there
      },
    });
    return Documentation.forLocalPackage(workdir, options);
  }

  public static async forLocalPackage(root: string, options?: DocumentationOptions): Promise<Documentation> {
    const manifestPath = path.join(root, 'package.json');
    if (!fs.existsSync(manifestPath)) {
      throw new Error(`Unable to locate package.json at: ${manifestPath}. Make sure to run this command `
        + 'from the root directory of your package after the jsii assembly has been created.');
    }
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    return Documentation.forAssembly(manifest.name, root, options);
  }

  public static async forAssembly(assemblyName: string, tsDir: string, options?: DocumentationOptions) {

    const ts = new reflect.TypeSystem();

    let language;

    if (options?.language) {
      switch (options?.language) {
        case 'python':
          language = TargetLanguage.PYTHON;
          break;
        default:
          throw new Error(`Unsupported language: ${language}. Choose one of ${Object.values(TargetLanguage)}`);
      }
    }

    for (let dotJsii of glob.sync(`${tsDir}/**/.jsii`)) {
      if (language) {
        const packageDir = path.dirname(dotJsii);
        try {
          await transliterateAssembly([packageDir], [language]);
          dotJsii = path.join(packageDir, `.jsii.${language}`);
        } catch (e) {
          console.log(`Failed transliterating ${dotJsii}: ${e}`);
        }
      }
      await ts.load(dotJsii);
    }
    return new Documentation(ts.findAssembly(assemblyName), options);

  }

  private readonly includeReadme: boolean;
  private readonly includeApiReference: boolean;

  private readonly transpile: Transpile;
  private readonly assembly: reflect.Assembly;
  private readonly submodule?: reflect.Submodule;

  private constructor(assembly: reflect.Assembly, options?: DocumentationOptions) {
    this.includeApiReference = options?.apiReference ?? true;
    this.includeReadme = options?.readme ?? true;
    this.assembly = assembly;
    this.submodule = options?.submodule ? this.findSubmodule(options.submodule) : undefined;

    const language = options?.language;

    if (language) {
      switch (language) {
        case TargetLanguage.PYTHON:
          this.transpile = new PythonTranspile();
          break;
        default:
          throw new Error(`Generating an API Refernce for ${language} is not supported yet.`
              + 'Either choose from [python] or disable api reference generation.');
      }
    } else {
      this.transpile = new TypeScriptTranspile();;
    }
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
      const apiReference = new ApiReference(this.transpile, this.assembly, this.submodule);
      documentation.section(apiReference.render());
    }
    return documentation;
  }

  /**
   * Lookup a submodule by a submodule name.
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

function toTargetLanguage(language: string) {

}
