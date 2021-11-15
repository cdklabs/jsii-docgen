import * as child from 'child_process';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs-extra';
import { Language, Documentation, TranspiledType, UnInstallablePackageError, CorruptedAssemblyError } from '../../../src';
import { extractPackageName } from '../../../src/docgen/view/documentation';
import { Assemblies } from '../assemblies';

const LIBRARIES = `${__dirname}/../../__fixtures__/libraries`;

// this is a little concerning...we should be mindful
// if need to keep increasing this.
jest.setTimeout(120 * 1000);


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

test('custom link formatter', async () => {
  const docs = await Documentation.forPackage('@aws-cdk/aws-ecr@1.106.0');
  try {
    const markdown = await docs.render({ language: Language.PYTHON, linkFormatter: (t: TranspiledType) => `#custom-${t.fqn}` });
    expect(markdown.render()).toMatchSnapshot();
  } finally {
    await docs.cleanup();
  }
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
  try {
    const markdown = await docs.render();
    expect(markdown.render()).toMatchSnapshot();
  } finally {
    await docs.cleanup();
  }
});

describe('python', () => {
  test('for package', async () => {
    const docs = await Documentation.forPackage('@aws-cdk/aws-ecr@1.106.0');
    try {
      const markdown = await docs.render({ language: Language.PYTHON });
      expect(markdown.render()).toMatchSnapshot();
    } finally {
      await docs.cleanup();
    }
  });

  test('snapshot - root module', async () => {
    const docs = await Documentation.forAssembly('@aws-cdk/aws-ecr', Assemblies.AWSCDK_1_106_0);
    const markdown = await docs.render({ language: Language.PYTHON });
    expect(markdown.render()).toMatchSnapshot();
  });

  test('snapshot - submodules', async () => {
    const docs = await Documentation.forAssembly('aws-cdk-lib', Assemblies.AWSCDK_1_106_0);
    try {
      const markdown = await docs.render({ language: Language.PYTHON, submodule: 'aws_eks' });
      expect(markdown.render()).toMatchSnapshot();
    } finally {
      await docs.cleanup();
    }
  });
});

describe('typescript', () => {
  test('for package', async () => {
    const docs = await Documentation.forPackage('@aws-cdk/aws-ecr@1.106.0');
    try {
      const markdown = await docs.render();
      expect(markdown.render()).toMatchSnapshot();
    } finally {
      await docs.cleanup();
    }
  });

  test('snapshot - single module', async () => {
    const docs = await Documentation.forAssembly('@aws-cdk/aws-ecr', Assemblies.AWSCDK_1_106_0);
    const markdown = await docs.render();
    expect(markdown.render()).toMatchSnapshot();
  });

  test('snapshot - submodules', async () => {
    const docs = await Documentation.forAssembly('aws-cdk-lib', Assemblies.AWSCDK_1_106_0);
    const markdown = await docs.render({ submodule: 'aws_eks' });
    expect(markdown.render()).toMatchSnapshot();
  });
});

describe('java', () => {
  test('for package', async () => {
    const docs = await Documentation.forPackage('@aws-cdk/aws-ecr@1.106.0');
    try {
      const markdown = await docs.render({ language: Language.JAVA });
      expect(markdown.render()).toMatchSnapshot();
    } finally {
      await docs.cleanup();
    }
  });

  test('snapshot - root module', async () => {
    const docs = await Documentation.forAssembly('@aws-cdk/aws-ecr', Assemblies.AWSCDK_1_106_0);
    const markdown = await docs.render({ language: Language.JAVA });
    expect(markdown.render()).toMatchSnapshot();
  });

  test('snapshot - submodules', async () => {
    const docs = await Documentation.forAssembly('aws-cdk-lib', Assemblies.AWSCDK_1_106_0);
    const markdown = await docs.render({ language: Language.JAVA, submodule: 'aws_eks' });
    expect(markdown.render()).toMatchSnapshot();
  });

  test('snapshot - submodules 2', async () => {
    const docs = await Documentation.forAssembly('monocdk', Assemblies.AWSCDK_1_106_0);
    const markdown = await docs.render({ language: Language.JAVA, submodule: 'aws_eks' });
    expect(markdown.render()).toMatchSnapshot();
  });
});

describe('csharp', () => {
  test('for package', async () => {
    const docs = await Documentation.forPackage('@aws-cdk/aws-ecr@1.106.0');
    try {
      const markdown = await docs.render({ language: Language.CSHARP });
      expect(markdown.render()).toMatchSnapshot();
    } finally {
      await docs.cleanup();
    }
  });

  test('snapshot - root module', async () => {
    const docs = await Documentation.forAssembly('@aws-cdk/aws-ecr', Assemblies.AWSCDK_1_106_0);
    const markdown = await docs.render({ language: Language.CSHARP });
    expect(markdown.render()).toMatchSnapshot();
  });

  test('snapshot - submodules', async () => {
    const docs = await Documentation.forAssembly('aws-cdk-lib', Assemblies.AWSCDK_1_106_0);
    const markdown = await docs.render({ language: Language.CSHARP, submodule: 'aws_eks' });
    expect(markdown.render()).toMatchSnapshot();
  });

  test('snapshot - submodules 2', async () => {
    const docs = await Documentation.forAssembly('monocdk', Assemblies.AWSCDK_1_106_0);
    const markdown = await docs.render({ language: Language.CSHARP, submodule: 'aws_eks' });
    expect(markdown.render()).toMatchSnapshot();
  });
});

test('throws uninstallable error on dependency conflict', async () => {
  // this package decalres a fixed peerDependency on constructs, which conflicts with its other dependencies
  return expect(Documentation.forPackage('cdk8s-mongo-sts@0.0.5')).rejects.toThrowError(UnInstallablePackageError);
});

test('throws uninstallable error on missing spec in dependencies', async () => {
  // this package has a corrupt package.json that doesn't contain a spec for some dependencies
  return expect(Documentation.forPackage('cdk-codepipeline-bitbucket-build-result-reporter@0.0.7')).rejects.toThrowError(UnInstallablePackageError);
});

test('throws corrupt assembly error on assembly suspcestable to https://github.com/aws/jsii/pull/3147', async () => {
  const docs = await Documentation.forPackage('@epilot/cdk-constructs@1.0.7');
  // this package accepts an unexported HttpApiProps in a constructor
  return expect(docs.render()).rejects.toThrowError(CorruptedAssemblyError);
});

test('throws corrupt assembly on dependency breaking change ', async () => {
  const docs = await Documentation.forPackage('@pahud/cdktf-aws-eks@0.2.42');
  // this package was built with a dependency (@cdktf/aws-provider) that removed
  // the EksCluster type in favor of a namespaced version (e.g EKS.EksCluster).
  return expect(docs.render()).rejects.toThrowError(CorruptedAssemblyError);
});