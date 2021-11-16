import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as glob from 'glob-promise';
import * as reflect from 'jsii-reflect';
import { TargetLanguage } from 'jsii-rosetta';
import { transliterateAssembly } from 'jsii-rosetta/lib/commands/transliterate';
import { Markdown } from '../render/markdown';
import { CSharpTranspile } from '../transpile/csharp';
import { JavaTranspile } from '../transpile/java';
import { PythonTranspile } from '../transpile/python';
import { Transpile, Language, TranspiledType } from '../transpile/transpile';
import { TypeScriptTranspile } from '../transpile/typescript';
import { Npm } from './_npm';
import { ApiReference } from './api-reference';
import { Readme } from './readme';

/**
 * Options for rendering a `Documentation` object.
 */
export interface RenderOptions {

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
 * Options for creating a `Documentation` object using the `fromLocalPackage` function.
 */
export interface ForLocalPackageDocumentationOptions {

  /**
   * A local directory containing jsii assembly files that will
   * comprise the type-system.
   *
   * @default - the root package directory will be used.
   */
  readonly assembliesDir?: string;
}

export interface ForPackageDocumentationOptions {

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
   * Note that this method installs the target package to the local file-system. Make sure
   * to call `Documentation.cleanup` once you are done rendering.
   *
   * @param target - The target to install. This can either be a local path or a registry identifier (e.g <name>@<version>)
   * @param options - Additional options.
   *
   * @throws NoSpaceLeftOnDevice if the installation fails due to running out of disk space
   * @throws NpmError if some `npm` command fails when preparing the working set
   */
  public static async forPackage(target: string, options: ForPackageDocumentationOptions = {}): Promise<Documentation> {
    const workdir = await fs.mkdtemp(path.join(os.tmpdir(), path.sep));

    if (await fs.pathExists(target) && !options.name) {
      throw new Error("'options.name' must be provided when installing local packages.");
    }

    const name = options?.name ?? extractPackageName(target);

    const npm = new Npm(workdir);

    console.log(`Installing package ${target}`);
    await npm.install(target);

    const docs = await Documentation.forProject(path.join(workdir, 'node_modules', name), { ...options, assembliesDir: workdir });

    // we cannot delete this directory immediately since it is used during `render` calls.
    // instead we register it so that callers can clean it up by calling the `cleanup` method.
    docs.addCleanupDirectory(workdir);

    return docs;
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
    return Documentation.forAssembly(name, assembliesDir);
  }

  /**
   * Create a `Documentation` object for a specific assembly from a directory of assemblies.
   *
   * @param assemblyName - The assembly name.
   * @param assembliesDir - The directory containing the assemblies that comprise the type-system.
   */
  public static async forAssembly(assemblyName: string, assembliesDir: string): Promise<Documentation> {
    return new Documentation(assemblyName, assembliesDir);
  }

  private readonly cleanupDirectories: Set<string> = new Set<string>();
  private readonly assembliesCache: Map<string, reflect.Assembly> = new Map<string, reflect.Assembly>();

  private constructor(
    private readonly assemblyName: string,
    private readonly assembliesDir: string,
  ) {}

  /**
   * Generate markdown.
   */
  public async render(options: RenderOptions = {}): Promise<Markdown> {

    const language = options.language ?? Language.TYPESCRIPT;
    const loose = options.loose ?? true;

    const { assembly, transpile } = await this.languageSpecific(language, loose);

    const submodule = options?.submodule ? this.findSubmodule(assembly, options.submodule) : undefined;
    const documentation = new Markdown();

    if (options?.readme ?? true) {
      const readme = new Readme(transpile, assembly, submodule);
      documentation.section(readme.render());
    }

    if (options?.apiReference ?? true) {
      const apiReference = new ApiReference(transpile, assembly, options?.linkFormatter ?? ((t: TranspiledType) => `#${t.fqn}`), submodule);
      documentation.section(apiReference.render());
    }

    return documentation;
  }

  private addCleanupDirectory(directory: string) {
    this.cleanupDirectories.add(directory);
  }

  /**
   * Removes any internal working directories.
   */
  public async cleanup() {
    for (const dir of [...this.cleanupDirectories]) {
      await fs.remove(dir);
      this.cleanupDirectories.delete(dir);
    }
  }

  private async languageSpecific(lang: Language, loose: boolean): Promise<{ assembly: reflect.Assembly; transpile: Transpile}> {

    let language, transpile = undefined;

    switch (lang) {
      case Language.PYTHON:
        language = TargetLanguage.PYTHON;
        transpile = new PythonTranspile();
        break;
      case Language.TYPESCRIPT:
        transpile = new TypeScriptTranspile();
        break;
      case Language.JAVA:
        language = TargetLanguage.JAVA;
        transpile = new JavaTranspile();
        break;
      case Language.CSHARP:
        transpile = new CSharpTranspile();
        language = TargetLanguage.CSHARP;
        break;
      default:
        throw new Error(`Unsupported language: ${lang}. Supported languages are ${Object.values(Language)}`);
    }
    return { assembly: await this.createAssembly(loose, language), transpile };
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

  private async createAssembly(loose: boolean, language?: TargetLanguage): Promise<reflect.Assembly> {

    const cacheKey = `lang:${language ?? 'ts'}.loose:${loose}`;
    const cached = this.assembliesCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const created = await withTempDir(async (workdir: string) => {

      // always better not to pollute an externally provided directory
      await fs.copy(this.assembliesDir, workdir);

      const ts = new reflect.TypeSystem();
      for (let dotJsii of await glob.promise(`${workdir}/**/.jsii`)) {
        // we only transliterate the top level assembly and not the entire type-system.
        // note that the only reason to translate dependant assemblies is to show code examples
        // for expanded python arguments - which we don't to right now anyway.
        // we don't want to make any assumption of the directory structure, so this is the most
        // robuse way to detect the root assembly.
        const spec = JSON.parse(await fs.readFile(dotJsii, 'utf-8'));
        if (language && spec.name === this.assemblyName) {
          const packageDir = path.dirname(dotJsii);
          await transliterateAssembly([packageDir], [language], { loose });
          dotJsii = path.join(packageDir, `.jsii.${language}`);
        }
        await ts.load(dotJsii);
      }
      return ts.findAssembly(this.assemblyName);
    });

    this.assembliesCache.set(cacheKey, created);
    return created;
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
