import * as os from 'os';
import * as path from 'path';
import { loadAssemblyFromFile, SPEC_FILE_NAME } from '@jsii/spec';
import * as fs from 'fs-extra';
import * as glob from 'glob-promise';
import * as reflect from 'jsii-reflect';
import { TargetLanguage, transliterateAssembly, UnknownSnippetMode } from 'jsii-rosetta';
import { Npm } from './_npm';
import { ApiReference } from './api-reference';
import { Readme } from './readme';
import { CorruptedAssemblyError, LanguageNotSupportedError } from '../..';
import { Json } from '../render/json';
import { MarkdownDocument } from '../render/markdown-doc';
import { MarkdownFormattingOptions, MarkdownRenderer } from '../render/markdown-render';
import { Schema, CURRENT_SCHEMA_VERSION, submodulePath } from '../schema';
import { CSharpTranspile } from '../transpile/csharp';
import { GoTranspile } from '../transpile/go';
import { JavaTranspile } from '../transpile/java';
import { PythonTranspile } from '../transpile/python';
import { Transpile, Language } from '../transpile/transpile';
import { TypeScriptTranspile } from '../transpile/typescript';

// https://github.com/aws/jsii/blob/main/packages/jsii-reflect/lib/assembly.ts#L175
const NOT_FOUND_IN_ASSEMBLY_REGEX = /Type '(.*)\..*' not found in assembly (.*)$/;

/**
 * Options for rendering a `Documentation` object.
 */
export interface RenderOptions extends TransliterationOptions {
  /**
   * Which language to generate docs for.
   */
  readonly language: Language;

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
   * Generate a single document with APIs from all assembly submodules
   * (including the root).
   *
   * Note: only the root-level README is included.
   *
   * @default false
   */
  readonly allSubmodules?: boolean;
}

export interface TransliterationOptions {
  /**
   * Whether to ignore missing fixture files that will prevent transliterating
   * some code snippet examples.
   *
   * @default true
   */
  readonly loose?: boolean;

  /**
   * Whether to validate jsii assemblies against the jsii schema before
   * using them.
   *
   * @default false
   */
  readonly validate?: boolean;
}

export interface MarkdownRenderOptions extends RenderOptions, MarkdownFormattingOptions {}

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
   * Whether verbose logging is to be performed.
   *
   * @default true
   */
  readonly verbose?: boolean;

  /**
   * A function to run after running `npm install` for the target package. This
   * exists only for testing purposes and should not be used by consumers of
   * this module.
   *
   * @internal
   */
  readonly _postInstall?: (dir: string) => Promise<void>;
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

    const npm = new Npm(workdir);

    if (options.verbose ?? true) {
      console.log(`Installing package ${target}`);
    }

    const name = await npm.install(target);

    if (options._postInstall != null) {
      await options._postInstall(workdir);
    }

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
  private assemblyFqn: string | undefined;

  private constructor(
    private readonly assemblyName: string,
    private readonly assembliesDir: string,
  ) {}

  /**
   * List all submodules in the assembly.
   */
  public async listSubmodules() {
    const tsAssembly = await this.createAssembly(undefined, { loose: true, validate: false });
    return tsAssembly.allSubmodules;
  }

  public async toIndexMarkdown(fileSuffix:string, options: RenderOptions) {
    const assembly = await this.createAssembly(undefined, { loose: true, validate: false });

    return MarkdownRenderer.fromSubmodules(await this.listSubmodules(), fileSuffix, {
      ...options,
      packageName: assembly.name,
      packageVersion: assembly.version,
    });
  }

  /**
   * Generate markdown.
   */
  public async toJson(options: RenderOptions): Promise<Json<Schema>> {

    const language = options.language ?? Language.TYPESCRIPT;
    const loose = options.loose ?? true;
    const validate = options.validate ?? false;
    const allSubmodules = options.allSubmodules ?? false;


    // Get the TS assembly first to check what languages are supported before calling rosetta
    const tsAssembly = await this.createAssembly(undefined, { loose, validate });
    const isSupported = language === Language.TYPESCRIPT || language.isValidConfiguration(tsAssembly?.targets?.[language.targetName]);
    this.assemblyFqn = `${tsAssembly.name}@${tsAssembly.version}`;

    if (!isSupported) {
      throw new LanguageNotSupportedError(`Laguage ${language} is not supported for package ${this.assemblyFqn}`);
    }

    let submoduleStr = options.submodule;

    if (allSubmodules && submoduleStr) {
      throw new Error('Cannot call toJson with allSubmodules and a specific submodule both selected.');
    }

    const { assembly, transpile } = await this.languageSpecific(language, { loose, validate });
    const targets = assembly.targets;

    if (!targets) {
      throw new Error(`Assembly ${this.assemblyFqn} does not have any targets defined`);
    }

    const submodule = submoduleStr ? this.findSubmodule(assembly, submoduleStr) : undefined;

    let readme: MarkdownDocument | undefined;
    if (options?.readme ?? false) {
      readme = new Readme(transpile, assembly, submodule).render();
    }

    let apiReference: ApiReference | undefined;
    if (options?.apiReference ?? true) {
      try {
        apiReference = new ApiReference(transpile, assembly, submodule, allSubmodules);
      } catch (error) {
        if (!(error instanceof Error)) {
          throw error;
        }
        throw maybeCorruptedAssemblyError(error) ?? error;
      }
    }

    const contents: Schema = {
      version: CURRENT_SCHEMA_VERSION,
      language: language.toString(),
      metadata: {
        packageName: assembly.name,
        packageVersion: assembly.version,
        submodule: submodulePath(submodule),
      },
      readme: readme?.render(),
      apiReference: apiReference?.toJson(),
    };

    return new Json(contents);
  }

  public async toMarkdown(options: MarkdownRenderOptions): Promise<MarkdownDocument> {
    const json = (await this.toJson(options)).content;
    return MarkdownRenderer.fromSchema(json, {
      anchorFormatter: options.anchorFormatter,
      linkFormatter: options.linkFormatter,
      typeFormatter: options.typeFormatter,
      header: options.header,
    });
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

  private async languageSpecific(
    lang: Language,
    options: Required<TransliterationOptions>,
  ): Promise<{ assembly: reflect.Assembly; transpile: Transpile}> {
    const { rosettaTarget, transpile } = LANGUAGE_SPECIFIC[lang.toString()];
    return { assembly: await this.createAssembly(rosettaTarget, options), transpile };
  }

  /**
   * Lookup a submodule by a submodule name.
   *
   * The contract of this function is historically quite confused: the submodule
   * name can be either an FQN (`asm.sub1.sub2`) or just a submodule name
   * (`sub1` or `sub1.sub2`).
   *
   * This is sligthly complicated by ambiguity: `asm.asm.package` and
   * `asm.package` can both exist, and which one do you mean when you say
   * `asm.package`?
   *
   * We prefer an FQN match if possible (`asm.sub1.sub2`), but will accept a
   * root-relative submodule name as well (`sub1.sub2`).
   */
  private findSubmodule(assembly: reflect.Assembly, submodule: string): reflect.Submodule {
    const fqnSubs = assembly.allSubmodules.filter(
      (s) => s.fqn === submodule,
    );
    if (fqnSubs.length === 1) {
      return fqnSubs[0];
    }

    // Fallback: assembly-relative name
    const relSubs = assembly.allSubmodules.filter(
      (s) => s.fqn === `${assembly.name}.${submodule}`,
    );
    if (relSubs.length === 1) {
      console.error(`[WARNING] findSubmodule() is being called with a relative submodule name: '${submodule}'. Prefer the absolute name: '${assembly.name}.${submodule}'`);
      return relSubs[0];
    }

    if (fqnSubs.length + relSubs.length === 0) {
      throw new Error(`Submodule ${submodule} not found in assembly ${assembly.name}@${assembly.version} (neither as '${submodule}' nor as '${assembly.name}.${submodule})`);
    }

    // Almost impossible that this would be true
    if (fqnSubs.length > 1) {
      throw new Error(`Found multiple submodules with FQN: ${submodule} in assembly ${assembly.name}@${assembly.version}`);
    }
    throw new Error(`Found multiple submodules with relative name: ${submodule} in assembly ${assembly.name}@${assembly.version}`);
  }

  private async createAssembly(
    language: TargetLanguage | undefined,
    options: Required<TransliterationOptions>,
  ): Promise<reflect.Assembly> {

    const cacheKey = `lang:${language ?? 'ts'}.loose:${options.loose}.validate:${options.validate}`;
    const cached = this.assembliesCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const created = await withTempDir(async (workdir: string) => {

      // always better not to pollute an externally provided directory
      await fs.copy(this.assembliesDir, workdir, {
        // Ensure we don't try to copy socket files, as they can be found under .git when
        // core.fsmonitor is enabled.
        filter: async (src) => {
          const stat = await fs.stat(src);
          return stat.isFile() || stat.isDirectory();
        },
      });

      const ts = new reflect.TypeSystem();
      for (let dotJsii of await glob.promise(`${this.assembliesDir}/**/${SPEC_FILE_NAME}`)) {
        // we only transliterate the top level assembly and not the entire type-system.
        // note that the only reason to translate dependant assemblies is to show code examples
        // for expanded python arguments - which we don't to right now anyway.
        // we don't want to make any assumption of the directory structure, so this is the most
        // robust way to detect the root assembly.
        const spec = loadAssemblyFromFile(dotJsii, false); // don't validate we only need this for the spec name
        if (language && spec.name === this.assemblyName) {
          const packageDir = path.dirname(dotJsii);
          try {
            await transliterateAssembly([packageDir], [language],
              { loose: options.loose, unknownSnippets: UnknownSnippetMode.FAIL, outdir: workdir });
          } catch (e: any) {
            throw new LanguageNotSupportedError(`Laguage ${language} is not supported for package ${this.assemblyFqn} (cause: ${e.message})`);
          }
          dotJsii = path.join(workdir, `${SPEC_FILE_NAME}.${language}`);
        }
        await loadAssembly(dotJsii, ts, options);
      }
      return ts.findAssembly(this.assemblyName);
    });

    this.assembliesCache.set(cacheKey, created);
    return created;
  }
}

export const LANGUAGE_SPECIFIC = {
  [Language.PYTHON.toString()]: {
    transpile: new PythonTranspile(),
    rosettaTarget: TargetLanguage.PYTHON,
  },
  [Language.TYPESCRIPT.toString()]: {
    transpile: new TypeScriptTranspile(),
    rosettaTarget: undefined, // no transpilation needed
  },
  [Language.JAVA.toString()]: {
    transpile: new JavaTranspile(),
    rosettaTarget: TargetLanguage.JAVA,
  },
  [Language.CSHARP.toString()]: {
    transpile: new CSharpTranspile(),
    rosettaTarget: TargetLanguage.CSHARP,
  },
  [Language.GO.toString()]: {
    transpile: new GoTranspile(),
    rosettaTarget: TargetLanguage.GO,
  },
};

/**
 * Loads the specified assembly document into the provided type system, and
 * recursively attempt to load the assembly's dependencies.
 *
 * @param dotJsii the assembly to be loaded.
 * @param ts the type system in which the assembly is to be loaded.
 * @param validate whether assemblies should be validated.
 */
async function loadAssembly(
  dotJsii: string,
  ts: reflect.TypeSystem,
  { validate }: { readonly validate?: boolean } = {},
): Promise<reflect.Assembly> {
  const loaded = await ts.load(dotJsii, { validate });

  for (const dep of Object.keys(loaded.spec.dependencies ?? {})) {
    if (ts.tryFindAssembly(dep) != null) {
      // dependency already loaded... move on...
      continue;
    }
    try {
      // Resolve the dependencies relative to the dependent's package root.
      const depPath = require.resolve(`${dep}/.jsii`, { paths: [path.dirname(dotJsii)] });
      await loadAssembly(depPath, ts, { validate });
    } catch {
      // Silently ignore any resolution errors... We'll fail later if the dependency is
      // ACTUALLY required, but it's okay to omit it if none of its types are actually exposed
      // by the translated assembly's own API.
    }
  }
  return loaded;
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

/**
 * Return a `CorruptedAssemblyError` if the error matches, undefined otherwise.
 *
 * Note that an 'not found in assembly` can be thrown in two cases:
 *
 * 1. Direct usage of `assembly.findType(fqn)`
 *
 *    In this case the error could be caused by a wrong FQN being passed to the function. This is not considered
 *    a corrupted assembly since the caller might be passing an FQN from a different assembly.
 *
 * 2. Implicit usage of `assembly.findType(fqn)` by calling `.type` (e.g `parameter.type`)
 *
 *    In this case the assembly we look in is always the same assembly the type itself comes from, and if it doesn't exist,
 *    then the assembly is considered corrupt.
 */
function maybeCorruptedAssemblyError(error: Error): CorruptedAssemblyError | undefined {

  const match = error.message.match(NOT_FOUND_IN_ASSEMBLY_REGEX);
  if (!match) {
    return;
  }
  const searchedAssembly = match[2];
  const typeAssembly = match[1];

  if (searchedAssembly === typeAssembly) {
    return new CorruptedAssemblyError(error.message);
  }
  return;
}
