import * as child from 'child_process';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs-extra';
import { Language, Documentation, TranspiledType } from '../../../src';
import { extractPackageName } from '../../../src/docgen/view/documentation';

const ASSEMBLIES = `${__dirname}/../../__fixtures__/assemblies`;
const LIBRARIES = `${__dirname}/../../__fixtures__/libraries`;

// this is a little concerning...we should be mindful
// if need to keep increasing this.
jest.setTimeout(60 * 1000);


describe('extractPackageName', () => {

  test('scope only', () => {
    expect(extractPackageName('@aws-cdk/aws-ecr')).toEqual('@aws-cdk/aws-ecr');
  });

  test('scope and version', () => {
    expect(extractPackageName('@aws-cdk/aws-ecr@1.100.1')).toEqual('@aws-cdk/aws-ecr');
  });

  test('no scope no version', () => {
    expect(extractPackageName('aws-cdk-lib')).toEqual('aws-cdk-lib');
  });

  test('version only', () => {
    expect(extractPackageName('aws-cdk-lib@1.100.1')).toEqual('aws-cdk-lib');
  });

});

test('package installation does not run lifecycle hooks', async () => {

  const workdir = await fs.mkdtemp(path.join(os.tmpdir(), path.sep));
  const libraryName = 'construct-library';
  const libraryDir = path.join(LIBRARIES, libraryName);

  await fs.copy(libraryDir, workdir);

  const manifestPath = path.join(workdir, 'package.json');
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf-8'));

  // inject a postinstall hook
  manifest.scripts.postinstall = 'exit 1';
  await fs.writeFile(manifestPath, JSON.stringify(manifest));

  // create the package
  child.execSync('yarn package', { cwd: workdir });

  // this should succeed because the failure script should be ignored
  const docs = await Documentation.forPackage(path.join(workdir, 'dist', 'js', `${libraryName}@0.0.0.jsii.tgz`), { name: libraryName });
  const markdown = docs.toMarkdown();
  expect(markdown.render()).toMatchSnapshot();
});

describe('python', async () => {

  test('for package', async () => {
    const docs = await Documentation.forPackage('@aws-cdk/aws-ecr@1.106.0', {
      language: Language.PYTHON,
    });
    const markdown = docs.toMarkdown();
    expect(markdown.render()).toMatchSnapshot();
  });

  test('custom link formatter', async () => {
    const docs = await cachedDocs('@aws-cdk/aws-ecr', Language.PYTHON);
    const markdown = docs.toMarkdown({ linkFormatter: (t: TranspiledType) => `#custom-${t.fqn}` });
    expect(markdown.render()).toMatchSnapshot();
  });

  test('markdown snapshot - root module', async () => {
    const docs = await cachedDocs('@aws-cdk/aws-ecr', Language.PYTHON);
    const markdown = docs.toMarkdown();
    expect(markdown.render()).toMatchSnapshot();
  });

  test('markdown snapshot - submodules', async () => {
    const docs = await cachedDocs('aws-cdk-lib', Language.PYTHON);
    const markdown = docs.toMarkdown({ submodule: 'aws_eks' });
    expect(markdown.render()).toMatchSnapshot();
  });

  test('json snapshot - single module', async () => {
    const docs = await cachedDocs('@aws-cdk/aws-ecr', Language.PYTHON);
    const json = docs.toJson();
    expect(json.render()).toMatchSnapshot();
  });

  test('json snapshot - submodules', async () => {
    const docs = await cachedDocs('aws-cdk-lib', Language.PYTHON);
    const json = docs.toJson({ submodule: 'aws_eks' });
    expect(json.render()).toMatchSnapshot();
  });

});

describe('typescript', async () => {

  test('for package', async () => {
    const docs = await Documentation.forPackage('@aws-cdk/aws-ecr@1.106.0');
    const markdown = docs.toMarkdown();
    expect(markdown.render()).toMatchSnapshot();
  });

  test('markdown snapshot - single module', async () => {
    const docs = await cachedDocs('@aws-cdk/aws-ecr', Language.TYPESCRIPT);
    const markdown = docs.toMarkdown();
    expect(markdown.render()).toMatchSnapshot();
  });

  test('markdown snapshot - submodules', async () => {
    const docs = await cachedDocs('aws-cdk-lib', Language.TYPESCRIPT);
    const markdown = docs.toMarkdown({ submodule: 'aws_eks' });
    expect(markdown.render()).toMatchSnapshot();
  });

  test('json snapshot - single module', async () => {
    const docs = await cachedDocs('@aws-cdk/aws-ecr', Language.TYPESCRIPT);
    const json = docs.toJson();
    expect(json.render()).toMatchSnapshot();
  });

  test('json snapshot - submodules', async () => {
    const docs = await cachedDocs('aws-cdk-lib', Language.TYPESCRIPT);
    const json = docs.toJson({ submodule: 'aws_eks' });
    expect(json.render()).toMatchSnapshot();
  });

});

const cache: Map<string, Documentation> = new Map();;

async function cachedDocs(pkg: string, language: Language): Promise<Documentation> {
  const key = `${pkg}.${language}`;
  if (!cache.has(key)) {
    cache.set(key, await Documentation.forAssembly(pkg, ASSEMBLIES, { language }));
  }
  return cache.get(key)!;
}
