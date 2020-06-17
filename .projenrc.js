const { TypeScriptLibraryProject, Semver, Jest, Eslint } = require('projen');

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
    'yargs': Semver.caret('15.3.1'),
    'fs-extra': Semver.caret('9.0.0'),
    'jsii-reflect': Semver.caret('1.6.0'),
    '@jsii/spec': Semver.caret('1.6.0')
  },
  releaseToNpm: true
});

project.synth();
