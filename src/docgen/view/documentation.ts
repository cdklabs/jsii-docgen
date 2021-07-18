import * as child from 'child_process';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as glob from 'glob-promise';
import * as reflect from 'jsii-reflect';
import { TargetLanguage } from 'jsii-rosetta';
import { transliterateAssembly } from 'jsii-rosetta/lib/commands/transliterate';
import { Markdown } from '../render/markdown';
import { PackagePageContent } from '../schema';
import { PythonTranspile } from '../transpile/python';
import { Transpile, Language, TranspiledType } from '../transpile/transpile';
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

  /**
   * How should links to types be rendered.
   *
   * @default '#{fqn}'
   */
  readonly linkFormatter?: (type: TranspiledType) => string;

}

/**
 * Options for creating a `Documentation` object.
 */
export interface DocumentationOptions {

  /**
   * Which language to generate docs for.
   *
   * @default Language.TYPESCRIPT
   */
  readonly language?: Language;

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

export interface ForPackageDocumentationOptions extends DocumentationOptions {

  /**
   * The name of the package to be installed.
   *
   * If the target you supply points to a local file, this is required.
   * Otherwise, it will be derived from the target.
   */
  readonly name?: string;
}

/**
 * Render documentation pages for a jsii library.
 */
export class Documentation {

  /**
   * Create a `Documentation` object from a package installable by npm.
   *
   * @param target - The target to install. This can either be a local path or a registry identifier (e.g <name>@<version>)
   * @param options - Additional options.
   */
  public static async forPackage(target: string, options: ForPackageDocumentationOptions = {}): Promise<Documentation> {
    return withTempDir(async (workdir: string) => {

      if (await fs.pathExists(target) && !options.name) {
        throw new Error('\'options.name\' must be provided when installing local packages.');
      }

      const name = options?.name ?? extractPackageName(target);

      // npm7 is needed so that we also install peerDependencies - they are needed to construct
      // the full type system.
      console.log('Installing npm7...');
      await spawn('npm', ['install', 'npm@7'], {
        cwd: workdir,
        shell: true,
        stdio: ['ignore', 'inherit', 'inherit'],
      });

      console.log(`Installing package ${target}`);
      await spawn(path.join(workdir, 'node_modules', '.bin', 'npm'), [
        'install',
        // this is critical from a security perspective to prevent
        // code execution as part of the install command using npm hooks. (e.g postInstall)
        '--ignore-scripts',
        // ensures npm does not insert anything in $PATH
        '--no-bin-links',
        '--no-save',
        target,
      ], {
        cwd: workdir,
        shell: true,
        stdio: ['ignore', 'inherit', 'inherit'],
      });

      return Documentation.forProject(path.join(workdir, 'node_modules', name), { ...options, assembliesDir: workdir } );
    });
  }

  /**
   * Create a `Documentation` object from a local directory containing a node project.
   *
   * @param root - The local directory path. Must contain a package.json file.
   * @param options - Additional options.
   */
  public static async forProject(root: string, options: ForLocalPackageDocumentationOptions = {}): Promise<Documentation> {
    const manifestPath = path.join(root, 'package.json');
    if (!(await fs.pathExists(manifestPath))) {
      throw new Error(`Unable to locate ${manifestPath}`);
    }

    // normally the assemblies are located in subdirectories
    // of the root package dir (i.e ./node_modules)
    const assembliesDir = options?.assembliesDir ?? root;

    const { name } = JSON.parse(await fs.readFile(manifestPath, 'utf-8'));
    return Documentation.forAssembly(name, assembliesDir, {
      language: options?.language,
      loose: options?.loose,
    });
  }

  /**
   * Create a `Documentation` object for a specific assembly from a directory of assemblies.
   *
   * @param assemblyName - The assembly name.
   * @param assembliesDir - The directory containing the assemblies that comprise the type-system.
   * @param options - Additional options.
   */
  public static async forAssembly(assemblyName: string, assembliesDir: string, options?: DocumentationOptions): Promise<Documentation> {
    return withTempDir(async (workdir: string) => {

      // always better not to operate on an externally provided directory
      await fs.copy(assembliesDir, workdir);

      let transpile, language;

      switch (options?.language ?? Language.TYPESCRIPT) {
        case Language.PYTHON:
          language = TargetLanguage.PYTHON;
          transpile = new PythonTranspile();
          break;
        case Language.TYPESCRIPT:
          transpile = new TypeScriptTranspile();
          break;
        default:
          throw new Error(`Unsupported language: ${options?.language}. Supported languages are ${Object.values(Language)}`);
      }
      const assembly = await createAssembly(assemblyName, workdir, options?.loose ?? true, language);
      return new Documentation(assembly, transpile);
    });

  }

  private constructor(
    public readonly assembly: reflect.Assembly,
    private readonly transpile: Transpile,
  ) {
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
      const apiReference = new ApiReference(this.transpile, this.assembly, options?.linkFormatter ?? ((t: TranspiledType) => `#${t.fqn}`), submodule);
      documentation.section(apiReference.render());
    }

    return documentation;
  }

  /**
   * Generate JSON schema for trasliterated package
   */
  public renderToJson(options: RenderOptions): PackagePageContent {
    const submodule = options?.submodule ? this.findSubmodule(this.assembly, options.submodule) : undefined;
    const readme = options?.readme
      ? new Readme(this.transpile, this.assembly, submodule)
        .render()
        .render()
      : undefined;

    const apiReference = options?.apiReference ? new ApiReference(
      this.transpile,
      this.assembly,
      options?.linkFormatter ?? ((t: TranspiledType) => `#${t.fqn}`),
      submodule,
    ).renderToJson() : undefined;

    return {
      readme,
      apiReference,
    };
  }

  /**
   * Lookup a submodule by a submodule name.
   */
  private findSubmodule(assembly: reflect.Assembly, submodule: string): reflect.Submodule {
    const submodules = assembly.submodules.filter(
      (s) => s.name === submodule,
    );

    if (submodules.length === 0) {
      throw new Error(`Submodule ${submodule} not found in assembly ${assembly.name}@${assembly.version}`);
    }

    if (submodules.length > 1) {
      throw new Error(`Found multiple submodules with name: ${submodule} in assembly ${assembly.name}@${assembly.version}`);
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

export function extractPackageName(spec: string) {
  const firstAt = spec.indexOf('@');

  if (firstAt === 0) {
    const lastAt = spec.indexOf('@', firstAt + 1);
    if (lastAt === -1) {
      // @aws-cdk/aws-ecr
      return spec;
    } else {
      // @aws-cdk/aws-ecr@2.0.0
      return spec.substring(0, lastAt);
    }
  }

  if (firstAt > 0) {
    // aws-cdk-lib@2.0.0
    return spec.substring(0, firstAt);
  }

  // aws-cdk-lib
  return spec;
}
