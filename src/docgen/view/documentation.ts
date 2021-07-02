import * as child from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as util from 'util';
import * as glob from 'glob-promise';
import * as reflect from 'jsii-reflect';
import { TargetLanguage } from 'jsii-rosetta';
import { transliterateAssembly } from 'jsii-rosetta/lib/commands/transliterate';
import { Markdown } from '../render/markdown';
import { PythonTranspile } from '../transpile/python';
import { Transpile } from '../transpile/transpile';
import { TypeScriptTranspile } from '../transpile/typescript';
import { ApiReference } from './api-reference';
import { Readme } from './readme';

const exec = util.promisify(child.exec);
const mkdtemp = util.promisify(fs.mkdtemp);

/**
 * Options for rendering a `Documentation` object.
 */
export interface RenderOptions {

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
 * Options for creating a `Documentation` object.
 */
export interface DocumentationOptions {

  /**
   * Which language to generate docs for.
   *
   * @default 'ts'
   */
  readonly language?: 'ts' | 'python';
}

/**
 * Render documentation pages for a jsii library.
 */
export class Documentation {

  public static async forRemotePackage(name: string, version: string, options?: DocumentationOptions): Promise<Documentation> {
    const workdir = await mkdtemp(path.join(os.tmpdir(), path.sep));
    const env = {
      ...process.env,
      HOME: os.tmpdir(), // npm fails with EROFS if $HOME is read-only, event if it won't write there
    };

    await exec('npm install npm@7', {
      cwd: workdir,
      env,
    });
    await exec(`${workdir}/node_modules/.bin/npm install --ignore-scripts --no-bin-links --no-save ${name}@${version}`, {
      cwd: workdir,
      env,
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

  public static async forAssembly(assemblyName: string, tsDir: string, options?: DocumentationOptions): Promise<Documentation> {
    const [language, transpile] = createLanguageInfo(options?.language ?? 'ts');
    const assembly = await createAssembly(assemblyName, tsDir, language);
    return new Documentation(assembly, transpile);
  }

  private readonly assembly: reflect.Assembly;
  private readonly transpile: Transpile;

  private constructor(assembly: reflect.Assembly, transpile: Transpile) {
    this.assembly = assembly;
    this.transpile = transpile;
  }

  /**
   * Generate markdown.
   */
  public async render(options?: RenderOptions): Promise<Markdown> {
    const submodule = options?.submodule ? this.findSubmodule(this.assembly, options.submodule) : undefined;
    const documentation = new Markdown();

    if (options?.readme ?? true) {
      const readme = new Readme(this.transpile, this.assembly, submodule);
      documentation.section(readme.render());
    }

    if (options?.apiReference ?? true) {
      const apiReference = new ApiReference(this.transpile, this.assembly, submodule);
      documentation.section(apiReference.render());
    }

    return documentation;
  }

  /**
   * Lookup a submodule by a submodule name.
   */
  private findSubmodule(assembly: reflect.Assembly, submodule?: string): reflect.Submodule {
    const submodules = assembly.submodules.filter(
      (s) => s.name === submodule,
    );

    if (submodules.length === 0) {
      throw new Error(`Submodule ${submodule} not found`);
    }

    if (submodules.length > 1) {
      throw new Error(`Found multiple submodules with name: ${submodule}`);
    }

    return submodules[0];
  }
}

function createLanguageInfo(language: string): [TargetLanguage | undefined, Transpile] {
  switch (language) {
    case 'python':
      return [TargetLanguage.PYTHON, new PythonTranspile()];
    case 'ts':
      return [undefined, new TypeScriptTranspile()];
    default:
      throw new Error(`Unsupported language: ${language}. Choose one of ${Object.values(TargetLanguage)}`);
  }
}

async function createAssembly(name: string, tsDir: string, language?: TargetLanguage): Promise<reflect.Assembly> {
  const ts = new reflect.TypeSystem();
  for (let dotJsii of await glob.promise(`${tsDir}/**/.jsii`)) {
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
  return ts.findAssembly(name);
}
