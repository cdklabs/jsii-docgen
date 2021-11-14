const { TypeScriptProject } = require('projen');

const project = new TypeScriptProject({
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
  compileBeforeTest: true, // we need this for the CLI test
  releaseToNpm: true,
  projenUpgradeSecret: 'PROJEN_GITHUB_TOKEN',
  autoApproveOptions: {
    allowedUsernames: ['cdklabs-automation'],
    secret: 'GITHUB_TOKEN',
  },
  autoApproveUpgrades: true,

  minNodeVersion: '12.13.0',
  tsconfig: {
    compilerOptions: {
      target: 'ES2019',
      lib: ['es2019'], // allow Array.prototype.flat etc.
    },
  },
});

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
