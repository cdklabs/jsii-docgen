const { TypeScriptLibraryProject, Semver } = require('projen');

const jsii = '1.9.0';

const project = new TypeScriptLibraryProject({
  name: 'jsii-docgen',
  description: 'generates api docs for jsii modules',
  repository: 'https://github.com/eladb/jsii-docgen',
  authorName: 'Elad Ben-Israel',
  authorEmail: 'benisrae@amazon.com',
  defaultReleaseBranch: 'master',

  bin: {
    'jsii-docgen': 'bin/jsii-docgen',
  },
  devDeps: [
    '@types/fs-extra@^8', // >8 needs a newer node version
    'glob-promise',
    'glob',
  ],
  deps: [
    'yargs',
    'fs-extra',
    'jsii-reflect',
    '@jsii/spec',
  ],
  releaseToNpm: true,
  projenUpgradeSecret: 'PROJEN_GITHUB_TOKEN',
  autoApproveOptions: {
    allowedUsernames: ['aws-cdk-automation'],
    secret: 'GITHUB_TOKEN',
  },
  autoApproveUpgrades: true,  
});

project.synth();
