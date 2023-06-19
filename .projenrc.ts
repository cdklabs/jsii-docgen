import { CdklabsTypeScriptProject } from 'cdklabs-projen-project-types';
import { JsonPatch } from 'projen';

const project = new CdklabsTypeScriptProject({
  stability: 'stable',
  private: false,
  projenrcTs: true,
  name: 'jsii-docgen',
  description: 'generates api docs for jsii modules',
  repository: 'https://github.com/cdklabs/jsii-docgen',
  authorName: 'Amazon Web Services',
  authorUrl: 'https://aws.amazon.com',
  authorOrganization: true,
  defaultReleaseBranch: 'main',

  bin: {
    'jsii-docgen': 'bin/jsii-docgen',
  },
  devDeps: [
    '@types/fs-extra',
    '@types/semver',
  ],
  deps: [
    '@jsii/spec',
    'case',
    'fs-extra',
    'glob-promise',
    'glob',
    'jsii-reflect',
    'jsii-rosetta',
    'semver',
    'yargs',
  ],
  releaseToNpm: true,
  autoApproveOptions: {
    allowedUsernames: ['cdklabs-automation'],
    secret: 'GITHUB_TOKEN',
  },
  autoApproveUpgrades: true,

  minNodeVersion: '16.0.0',
  workflowNodeVersion: '16.x',
  jestOptions: {
    jestConfig: {
      setupFilesAfterEnv: ['<rootDir>/test/setup-jest.ts'],
    },
  },
  tsconfig: {
    compilerOptions: {
      target: 'ES2019',
      lib: ['es2019'], // allow Array.prototype.flat etc.
      skipLibCheck: true,
    },
  },
});

// Suppress upgrade prompts, in particular from test runs.
project.tasks.addEnvironment('JSII_SUPPRESS_UPGRADE_PROMPT', 'true');

project.github?.tryFindWorkflow('release')?.file?.patch(JsonPatch.add('/jobs/release/env/NODE_OPTIONS', '--max_old_space_size=4096'));
project.github?.tryFindWorkflow('build')?.file?.patch(JsonPatch.add('/jobs/build/env/NODE_OPTIONS', '--max_old_space_size=4096'));

const libraryFixtures = ['construct-library'];

// compile the test fixtures with jsii
for (const library of libraryFixtures) {
  project.compileTask.exec('npm ci', { cwd: `./test/__fixtures__/libraries/${library}` });
  project.compileTask.exec('npm run compile', { cwd: `./test/__fixtures__/libraries/${library}` });
}

// artifacts created by transpilation in tests
project.gitignore.exclude('test/**/.jsii.*');

// local vscode configuration
project.gitignore.exclude('.vscode/');

project.synth();
