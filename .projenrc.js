const { TypeScriptLibraryProject, Semver, Jest, Eslint } = require('projen');

const jsii = '1.9.0';

const project = new TypeScriptLibraryProject({
  name: 'jsii-docgen',
  description: 'generates api docs for jsii modules',
  repository: 'https://github.com/eladb/jsii-docgen',
  authorName: 'Elad Ben-Israel',
  authorEmail: 'benisrae@amazon.com',
  bin: {
    'jsii-docgen': 'bin/jsii-docgen'
  },
  devDependencies: {
    '@types/node': Semver.caret('13.9.8'),
    '@types/fs-extra': Semver.caret('8.1.0'),
    'glob-promise': Semver.caret('3.4.0'),
    'glob': Semver.caret('7.1.6'),
  },
  dependencies: {
    'yargs': Semver.caret('15.4.1'),
    'fs-extra': Semver.caret('9.0.0'),
    'jsii-reflect': Semver.caret(jsii),
    '@jsii/spec': Semver.caret(jsii)
  },
  releaseToNpm: true,
  projenUpgradeSecret: 'PROJEN_GITHUB_TOKEN'
});

project.synth();
