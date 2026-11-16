import * as os from 'os';
import * as path from 'path';
import { Assembly, PrimitiveType, SchemaVersion, SPEC_FILE_NAME, TypeKind } from '@jsii/spec';
import * as fs from 'fs-extra';
import { Documentation, Language, LanguageNotSupportedError } from '../../../src';
import { Assemblies } from '../assemblies';

const DEPENDENCY = 'dependency-lib';
const CONSUMER = 'consumer-lib';

function assembly(name: string, props: Pick<Assembly, 'targets' | 'types'> & Partial<Assembly>): Assembly {
  return {
    schema: SchemaVersion.LATEST,
    name,
    version: '1.0.0',
    description: name,
    license: 'Apache-2.0',
    homepage: `https://github.com/example/${name}`,
    repository: { type: 'git', url: `https://github.com/example/${name}.git` },
    author: { name: 'Example', roles: ['author'] },
    jsiiVersion: '5.9.0',
    fingerprint: name,
    ...props,
  };
}

/**
 * Writes a Go enabled `consumer-lib` assembly whose public API exposes a type
 * from `dependency-lib`, and the `dependency-lib` assembly itself.
 */
async function writeAssemblies(dependencyTargets: Assembly['targets']): Promise<string> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'jsii-docgen-go-'));

  const dependency = assembly(DEPENDENCY, {
    targets: dependencyTargets,
    types: {
      [`${DEPENDENCY}.IThing`]: {
        assembly: DEPENDENCY,
        fqn: `${DEPENDENCY}.IThing`,
        kind: TypeKind.Interface,
        name: 'IThing',
        docs: { summary: 'A thing from the dependency.' },
        properties: [{
          abstract: true,
          immutable: true,
          name: 'label',
          type: { primitive: PrimitiveType.String },
        }],
      },
    },
  });

  const consumer = assembly(CONSUMER, {
    targets: {
      js: { npm: CONSUMER },
      go: { moduleName: 'github.com/example/consumer-lib-go' },
    },
    dependencies: { [DEPENDENCY]: '^1.0.0' },
    dependencyClosure: { [DEPENDENCY]: { targets: dependencyTargets } },
    types: {
      [`${CONSUMER}.Consumer`]: {
        assembly: CONSUMER,
        fqn: `${CONSUMER}.Consumer`,
        kind: TypeKind.Class,
        name: 'Consumer',
        docs: { summary: 'Exposes a type from the dependency.' },
        initializer: {},
        properties: [{
          immutable: true,
          name: 'thing',
          type: { fqn: `${DEPENDENCY}.IThing` },
        }],
      },
    },
  });

  for (const asm of [dependency, consumer]) {
    const pkgDir = path.join(dir, 'node_modules', asm.name);
    await fs.mkdirp(pkgDir);
    await fs.writeJson(path.join(pkgDir, 'package.json'), { name: asm.name, version: asm.version });
    await fs.writeJson(path.join(pkgDir, SPEC_FILE_NAME), asm);
  }
  return dir;
}

describe('go', () => {
  let dir: string | undefined;

  afterEach(async () => {
    if (dir) {
      await fs.remove(dir);
      dir = undefined;
    }
  });

  test('throws LanguageNotSupportedError when a referenced dependency has no go target', async () => {
    dir = await writeAssemblies({ js: { npm: DEPENDENCY } });
    const docs = await Documentation.forAssembly(CONSUMER, dir);

    await expect(docs.toJson({ language: Language.GO })).rejects.toThrowError(LanguageNotSupportedError);
    await expect(docs.toMarkdown({ language: Language.GO })).rejects.toThrowError(
      `Go is not a supported target for module: ${DEPENDENCY} ("jsii.targets.go.moduleName" is not configured)`,
    );
  });

  test('renders when the referenced dependency has a go target', async () => {
    dir = await writeAssemblies({
      js: { npm: DEPENDENCY },
      go: { moduleName: 'github.com/example/dependency-lib-go' },
    });
    const docs = await Documentation.forAssembly(CONSUMER, dir);

    const markdown = (await docs.toMarkdown({ language: Language.GO })).render();
    expect(markdown).toContain('github.com/example/consumer-lib-go/consumerlib');
    expect(markdown).toContain('github.com/example/dependency-lib-go/dependencylib');
  });

  test('still renders a go enabled package from the fixtures', async () => {
    const docs = await Documentation.forAssembly('constructs', Assemblies.AWSCDK_1_106_0);
    const markdown = (await docs.toMarkdown({ language: Language.GO })).render();
    expect(markdown).toContain('github.com/aws/constructs-go/constructs');
  });
});
