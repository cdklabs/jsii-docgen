import { spawn, SpawnOptionsWithoutStdio } from 'child_process';
import * as os from 'os';
import { join } from 'path';
import { NoSpaceLeftOnDevice, NpmError } from '../..';

export class Npm {
  #npmCommand: string | undefined;

  public constructor(private readonly workingDirectory: string, private readonly logger = console.log) { }

  public async install(target: string): Promise<void> {
    return this.runCommand(
      await this.npmCommandPath(),
      [
        'install',
        // this is critical from a security perspective to prevent
        // code execution as part of the install command using npm hooks. (e.g postInstall)
        '--ignore-scripts',
        // ensures npm does not insert anything in $PATH
        '--no-bin-links',
        '--no-save',
        // ensures we are installing devDependencies, too.
        '--include=dev',
        target,
      ],
      {
        cwd: this.workingDirectory,
        shell: true,
      },
    );
  }

  private async npmCommandPath(): Promise<string> {
    if (this.#npmCommand) {
      return this.#npmCommand;
    }
    // npm7 is needed so that we also install peerDependencies - they are needed to construct
    // the full type system.
    this.logger('Installing npm7...');
    await this.runCommand(
      'npm',
      ['install', 'npm@7', '--no-save'],
      {
        cwd: this.workingDirectory,
        shell: true,
      });
    return this.#npmCommand = join(this.workingDirectory, 'node_modules', '.bin', 'npm');
  }

  private async runCommand(command: string, args: readonly string[], options?: SpawnOptionsWithoutStdio): Promise<void> {
    return new Promise<void>((ok, ko) => {
      const child = spawn(command, args, { ...options, stdio: ['inherit', 'pipe', 'pipe'] });

      const stdout = new Array<Buffer>();
      child.stdout.on('data', (chunk) => {
        process.stdout.write(chunk);
        stdout.push(Buffer.from(chunk));
      });
      const stderr = new Array<Buffer>();
      child.stderr.on('data', (chunk) => {
        process.stderr.write(chunk);
        stderr.push(Buffer.from(chunk));
      });

      child.once('error', ko);
      child.once('close', (code, signal) => {
        if (code === 0) {
          ok();
        } else {
          const fullCommand = [command, ...args].join(' ');
          if (signal != null) {
            return ko(new NpmError(`Command "${fullCommand}" was killed by signal ${signal}`, { stdout, stderr }));
          }
          if (code === 228) {
            // npm install exits with code 228 when it encounters the ENOSPC
            // errno while doing it's business. This is effectively 256 - ENOSPC
            // (which is 28). In this case, we'll throw a
            // NoSpaceLeftOnDeviceError so that consumers can perform special
            // handling if they so desire.
            return ko(new NoSpaceLeftOnDevice(`No space left on device when running "${fullCommand}"`));
          }
          const maybeerrno = 256 - code!;
          for (const [errname, errno] of Object.entries(os.constants.errno)) {
            if (maybeerrno === errno) {
              return ko(new NpmError(`Command "${fullCommand}' command exited with code ${code} (possibly ${errname})`, { stdout, stderr }));
            }
          }
          ko(new NpmError(`Command "${fullCommand}' command exited with code ${code}`, { stdout, stderr }));
        }
      });
    });
  }
}
