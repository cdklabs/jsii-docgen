const { TypeScriptProject } = require('projen');

const jsii = '1.9.0';

const project = new TypeScriptProject({
  name: 'jsii-docgen',
  description: 'generates api docs for jsii modules',
  repository: 'https://github.com/eladb/jsii-docgen',
  authorName: 'Elad Ben-Israel',
  authorEmail: 'benisrae@amazon.com',
  bin: {
    'jsii-docgen': 'bin/jsii-docgen',
  },
  devDeps: [
    '@types/node@^13.9.8',
    '@types/fs-extra@68.1.0',
    'glob-promise@^3.4.0',
    'glob@^7.1.6',
  ],
  deps: [
    'yargs@^15.4.1',
    'fs-extra@^9.0.0',
    `jsii-reflect@^${jsii}`,
    `@jsii/spec@^${jsii}`,
  ],
  releaseToNpm: true,
  projenUpgradeSecret: 'PROJEN_GITHUB_TOKEN',
});

project.synth();
