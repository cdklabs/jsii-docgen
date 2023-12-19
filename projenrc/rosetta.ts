import { Component, typescript } from 'projen';
import { minVersion } from 'semver';

const JSII_ROSETTA = 'jsii-rosetta';

export enum RosettaVersionLines {
  V1_X,
  V5_0,
  V5_1,
  V5_2,
  V5_3,
}

export interface RosettaPeerDependencyOptions {
  /**
   * Provide the semver constraint for supported version for each Rosetta version line
   * Set `false` to disable support for a version line.
   */
  readonly supportedVersions: Record<RosettaVersionLines, string | false>;
}

export class RosettaPeerDependency extends Component {
  public constructor(project: typescript.TypeScriptProject, options: RosettaPeerDependencyOptions) {
    super(project);

    const constraint = this.calculateVersionConstraint(options.supportedVersions);
    project.addDevDeps(constraint);
    project.addPeerDeps(constraint);

    project.github?.tryFindWorkflow('build')?.addJob('rosetta-compat', {
      runsOn: ['ubuntu-latest'],
      permissions: {},
      env: {
        CI: 'true',
        NODE_OPTIONS: '--max_old_space_size=4096',
      },
      strategy: {
        matrix: {
          domain: {
            rosetta: this.calculateMinimalVersions(options.supportedVersions),
          },
        },
      },
      steps: [{
        name: 'Checkout',
        uses: 'actions/checkout@v3',
        with: {
          ref: '${{ github.event.pull_request.head.ref }}',
          repository: '${{ github.event.pull_request.head.repo.full_name }}',
        },
      },
      {
        name: 'Setup Node.js',
        uses: 'actions/setup-node@v3',
        with: {
          // @ts-ignore
          'node-version': project.nodeVersion,
        },
      },
      {
        name: 'Install dependencies',
        run: 'yarn install --check-files',
      },
      {
        name: 'Install Rosetta version',
        run: `yarn add --dev ${JSII_ROSETTA}@\${{ matrix.rosetta }}`,
      },
      {
        name: 'compile+test',
        run: ['npx projen compile', 'npx projen test'].join('\n'),
      },
      {
        name: 'Check Rosetta version',
        run: `test $(npx ${JSII_ROSETTA} --version) = "\${{ matrix.rosetta }}"`,
      }],
    });
  }

  private calculateVersionConstraint(versions: RosettaPeerDependencyOptions['supportedVersions']): string {
    const comparators = Object.values(versions).filter(Boolean).join(' || ');
    return JSII_ROSETTA + '@' + comparators;
  }

  private calculateMinimalVersions(versions: RosettaPeerDependencyOptions['supportedVersions']): string[] {
    const discoveredVersions = new Array<string>();
    for (const comparator of Object.values(versions)) {
      if (comparator) {
        const minimum = minVersion(comparator)?.version;
        if (minimum) {
          discoveredVersions.push(minimum);
        }
      }
    }

    return discoveredVersions;
  }
}
