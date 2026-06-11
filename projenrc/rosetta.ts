import { Component, github, typescript } from 'projen';
import { minVersion } from 'semver';

const JSII_ROSETTA = 'jsii-rosetta';

export enum RosettaVersionLines {
  V1_X,
  V5_0,
  V5_1,
  V5_2,
  V5_3,
  V5_4,
  V5_5,
  V5_6,
  V5_7,
  V5_8,
  V5_9,
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
    const minVersions = this.calculateMinimalVersions(options.supportedVersions);
    const latestVersion = this.calculateLatestVersion(options.supportedVersions);

    project.addDevDeps(constraint);
    project.addPeerDeps(constraint);

    project.github?.tryFindWorkflow('build')?.addJob('rosetta-matrix', {
      runsOn: ['${{ matrix.os }}'],
      permissions: {},
      env: {
        CI: 'true',
        NODE_OPTIONS: '--max_old_space_size=4096',
      },
      strategy: {
        matrix: {
          domain: {
            rosetta: minVersions,
            os: ['ubuntu-latest'],
          },
          include: [{
            rosetta: latestVersion,
            os: 'windows-latest',
          }],
        },
      },
      steps: [
        github.WorkflowSteps.checkout({
          with: {
            ref: '${{ github.event.pull_request.head.ref }}',
            repository: '${{ github.event.pull_request.head.repo.full_name }}',
          },
        }),
        {
          name: 'Enable Corepack',
          shell: 'bash',
          run: [
            '# The pre-installed Yarn Classic shims on Windows GHA runners shadow',
            "# Corepack's yarn proxy. Re-installing corepack globally replaces them.",
            '# See: https://github.com/actions/setup-node/issues/531',
            'if [[ "$RUNNER_OS" == "Windows" ]]; then',
            '  npm install -g corepack@0.34.6 --force',
            'fi',
            'corepack enable',
          ].join('\n'),
        },
        {
          name: 'Setup Node.js',
          uses: 'actions/setup-node@v6',
          with: {
            // @ts-ignore - nodeVersion is protected but accessible in projenrc
            'node-version': project.nodeVersion,
            'package-manager-cache': false,
          },
        },
        {
          if: "runner.os == 'Windows'",
          name: 'Windows performance improvements',
          run: [
            'yarn config set cacheFolder D:\\a\\_temp\\yarn',
            'echo "TEMP=D:\\a\\_temp" >> $env:GITHUB_ENV',
          ].join('\n'),
        },
        {
          name: 'Install dependencies',
          run: 'yarn install --no-immutable',
        },
        {
          name: 'Install Rosetta version',
          run: `yarn add --dev ${JSII_ROSETTA}@\${{ matrix.rosetta }}`,
        },
        {
          name: 'compile+test',
          run: ['yarn projen compile', 'yarn projen test --runInBand'].join('\n'),
        },
        {
          name: 'Check Rosetta version',
          run: `test $(yarn exec ${JSII_ROSETTA} --version) = "\${{ matrix.rosetta }}"`,
        },
      ],
    });
    project.github?.tryFindWorkflow('build')?.addJob('rosetta-compat', {
      // This is a simple "join target" to simplify branch protection rules.
      env: { CI: 'true' },
      name: 'Rosetta Compat Tests',
      needs: ['rosetta-matrix'],
      permissions: {},
      runsOn: ['ubuntu-latest'],
      if: 'always()',
      steps: [
        {
          name: 'Tests result',
          run: 'echo ${{needs.rosetta-matrix.result}}',
        },
        {
          if: "${{ needs.rosetta-matrix.result != 'success' }}",
          name: 'Set status based on matrix build',
          run: 'exit 1',
        },
      ],
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

  private calculateLatestVersion(versions: RosettaPeerDependencyOptions['supportedVersions']): string {
    const discoveredVersions = this.calculateMinimalVersions(versions);
    return discoveredVersions.sort().pop() ?? 'latest';
  }
}
