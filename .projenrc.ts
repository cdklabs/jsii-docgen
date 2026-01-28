import { CdklabsTypeScriptProject } from 'cdklabs-projen-project-types';
import { JsonPatch } from 'projen';
import { RosettaPeerDependency, RosettaVersionLines } from './projenrc/rosetta';

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
    'fast-glob',
    'jsii-reflect',
    'json-stream-stringify',
    'semver',
    'yargs',
  ],
  peerDependencyOptions: {
    pinnedDevDependency: false,
  },
  releaseToNpm: true,
  autoApproveOptions: {
    allowedUsernames: ['cdklabs-automation'],
    secret: 'GITHUB_TOKEN',
  },
  autoApproveUpgrades: true,

  minNodeVersion: '20.16.0',
  setNodeEngineVersion: false,
  workflowNodeVersion: '20.x',
  jestOptions: {
    jestConfig: {
      setupFilesAfterEnv: ['<rootDir>/test/setup-jest.ts'],
      testMatch: [
        // On Windows the standard tests paths are not matched
        // Use this simplified version instead that works good enough in this repo
        '<rootDir>/test/**/*.test.ts',
      ],
    },
  },
  tsconfig: {
    compilerOptions: {
      target: 'ES2019',
      lib: ['es2019'], // allow Array.prototype.flat etc.
      skipLibCheck: true,
    },
  },

  // Because githubOptions: { mergify: false } has no effect on this project type
  enablePRAutoMerge: true,
});

// Suppress upgrade prompts, in particular from test runs.
project.tasks.addEnvironment('JSII_SUPPRESS_UPGRADE_PROMPT', 'true');

// Add the new version line here
new RosettaPeerDependency(project, {
  supportedVersions: {
    [RosettaVersionLines.V1_X]: '^1.85.0',
    [RosettaVersionLines.V5_0]: '~5.0.14',
    [RosettaVersionLines.V5_1]: '~5.1.2',
    [RosettaVersionLines.V5_2]: '~5.2.0',
    [RosettaVersionLines.V5_3]: '~5.3.0',
    [RosettaVersionLines.V5_4]: '~5.4.0',
    [RosettaVersionLines.V5_5]: '~5.5.0',
    [RosettaVersionLines.V5_6]: '~5.6.0',
    [RosettaVersionLines.V5_7]: '~5.7.0',
    [RosettaVersionLines.V5_8]: '~5.8.0',
    [RosettaVersionLines.V5_9]: '~5.9.1',
  },
});

project.github?.tryFindWorkflow('release')?.file?.patch(JsonPatch.add('/jobs/release/env/NODE_OPTIONS', '--max_old_space_size=4096'));
project.github?.tryFindWorkflow('build')?.file?.patch(JsonPatch.add('/jobs/build/env/NODE_OPTIONS', '--max_old_space_size=4096'));

// trusted publishing requires npm 11, which comes built-in with node 24.
project.github?.tryFindWorkflow('release')?.file?.patch(JsonPatch.add('/jobs/release_npm/steps/0/with/node-version', '24.x'));

const libraryFixtures = ['construct-library', 'lib-with-intersections'];

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
