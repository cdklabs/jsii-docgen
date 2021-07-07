import * as child from 'child_process';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs-extra';
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
  readonly language?: string;

  /**
   * Whether to ignore missing fixture files that will prevent transliterating
   * some code snippet examples.
   *
   * @default true
   */
  readonly loose?: boolean;
}

/**
 * Options for creating a `Documentation` object using the `fromLocalPackage` function.
 */
export interface ForLocalPackageDocumentationOptions extends DocumentationOptions {

  /**
   * A local directory containing jsii assembly files that will
   * comprise the type-system.
   *
   * @default - the root package directory will be used.
   */
  readonly assembliesDir?: string;
}

/**
 * Render documentation pages for a jsii library.
 */
export class Documentation {

  /**
   * Create a `Documentation` object for a remote package available in the npm registry.
   */
  public static async forRegistryPackage(name: string, version: string, options?: DocumentationOptions): Promise<Documentation> {
    return withTempDir(async (workdir: string) => {
      const env = {
        ...process.env,
        // npm fails with EROFS if $HOME is read-only, even if it won't write there
        HOME: os.tmpdir(),
      };

      // npm7 is needed so that we also install peerDependencies - they are needed to construct
      // the full type system.
      await spawn('npm', ['install', 'npm@7'], {
        cwd: workdir,
        env,
      });

      await spawn(path.join(workdir, 'node_modules', '.bin', 'npm'), [
        'install',
        // this is critical from a security perspective to prevent
        // code execution as part of the install command using npm hooks. (e.g postInstall)
        '--ignore-scripts',
        // ensures npm does not insert anything in $PATH
        '--no-bin-links',
        '--no-save',
        `${name}@${version}`,
      ], {
        cwd: workdir,
        env,
      });

      return Documentation.forLocalPackage(path.join(workdir, 'node_modules', name), { ...options, assembliesDir: workdir } );
    });
  }

  /**
   * Create a `Documentation` object for a package available in the local file system.
   */
  public static async forLocalPackage(root: string, options: ForLocalPackageDocumentationOptions = {}): Promise<Documentation> {
    const manifestPath = path.join(root, 'package.json');
    if (!(await fs.pathExists(manifestPath))) {
      throw new Error(`Unable to locate ${manifestPath}`);
    }

    // normally the assemblies are located in subdirectories
    // of the root package dir (i.e ./node_modules)
    const assembliesDir = options?.assembliesDir ?? root;

    const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf-8'));
    return Documentation.forAssembly(manifest.name, assembliesDir, {
      language: options?.language,
      loose: options?.loose,
    });
  }

  /**
   * Create a `Documentation` object for a specific assembly that resides in a directory of assemblies.
   * The directory will comprise the entire type-system available to the generartion process.
   */
  public static async forAssembly(assemblyName: string, assembliesDir: string, options?: DocumentationOptions): Promise<Documentation> {
    return withTempDir(async (workdir: string) => {

      // always better not to operate on an externally provided directory
      await fs.copy(assembliesDir, workdir);

      let transpile, language;

      switch (options?.language ?? 'ts') {
        case 'python':
          language = TargetLanguage.PYTHON;
          transpile = new PythonTranspile();
          break;
        case 'ts':
          transpile = new TypeScriptTranspile();
          break;
        default:
          throw new Error(`Unsupported language: ${options?.language}`);
      }
      const assembly = await createAssembly(assemblyName, workdir, options?.loose ?? true, language);
      return new Documentation(assembly, transpile);
    });

  }

  private constructor(
    private readonly assembly: reflect.Assembly,
    private readonly transpile: Transpile) {
  }

  /**
   * Generate markdown.
   */
  public render(options?: RenderOptions): Markdown {
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

async function withTempDir<T>(work: (workdir: string) => Promise<T>): Promise<T> {
  const workdir = await fs.mkdtemp(path.join(os.tmpdir(), path.sep));
  const cwd = process.cwd();
  try {
    process.chdir(workdir);
    // wait for the work to be completed before
    // we cleanup the work environment.
    return await work(workdir);
  } finally {
    process.chdir(cwd);
    await fs.remove(workdir);
  }
}

async function createAssembly(name: string, tsDir: string, loose: boolean, language?: TargetLanguage): Promise<reflect.Assembly> {
  console.log(`Creating assembly in ${language ?? 'ts'} for ${name} from ${tsDir} (loose: ${loose})`);
  const ts = new reflect.TypeSystem();
  for (let dotJsii of await glob.promise(`${tsDir}/**/.jsii`)) {
    if (language) {
      const packageDir = path.dirname(dotJsii);
      await transliterateAssembly([packageDir], [language], { loose });
      dotJsii = path.join(packageDir, `.jsii.${language}`);
    }
    await ts.load(dotJsii);
  }
  return ts.findAssembly(name);
}

async function spawn(command: string, args?: ReadonlyArray<string>, options?: child.SpawnOptions) {
  return new Promise<void>((ok, ko) => {
    const p = child.spawn(command, args, options);
    p.once('error', ko);
    p.once('close', (code, signal) => {
      if (code === 0) {
        ok();
      } else {
        ko(`'${command}' command ${code != null ? `exited with code ${code}` : `was terminated by signal ${signal}`}`);
      }
    });
  });
}