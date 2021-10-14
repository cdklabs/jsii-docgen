// eslint-disable-next-line @typescript-eslint/no-require-imports
const { name } = require('../package.json');

/**
 * The error raised when processing a package fails due to running out of disk
 * space while installing it's dependency closure in a temporary directory. This
 * error cannot be immediately recovered, short of deleting files to make more
 * space availabe, then retrying.
 *
 * Users may perform an `err instanceof NoSpaceLeftOnDevice` test to determine
 * whether this error was raised or not, and cut retry attempts.
 */
export class NoSpaceLeftOnDevice extends Error {
  public readonly name = `${name}.${this.constructor.name}`;

  /** @internal */
  public constructor(message: string, stack?: string) {
    super(message);
    if (this.stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * The error raised when `npm` commands fail with an "opaque" exit code,
 * attempting to obtain more information from the commands output.
 */
export class NpmError extends Error {
  /**
   * The error code npm printed out to stderr or stdout before exiting. This can
   * provide more information about the error in a machine-friendlier way.
   *
   * This is extracted from log-parsing, and is hence not guaranteed to be
   * accurate.
   *
   * @example 'EPROTO'
   * @example 'E429'
   */
  public readonly npmErrorCode: string | undefined;

  /**
   * Data the command produced to `STDOUT`. This field is not included in the
   * `JSON.stringify()` output for this type.
   */
  public readonly stdout: string;

  /**
   * Data the command produced to `STDERR`. This field is not included in the
   * `JSON.stringify()` output for this type.
   */
  public readonly stderr: string;

  /** @internal */
  public constructor(message: string, stdio: { stdout: readonly Buffer[]; stderr: readonly Buffer[] }) {
    super(message);
    Error.captureStackTrace(this, this.constructor);

    this.stdout = Buffer.concat(stdio.stdout).toString('utf-8');
    this.stderr = Buffer.concat(stdio.stderr).toString('utf-8');

    this.name = `${name}.${this.constructor.name}`;

    const ERROR_CODE_REGEX = /^npm\s+ERR!\s+(?:code|errno)\s+(E[^\s]+|\d+)$/gm;
    for (const output of [this.stderr, this.stdout]) {
      const [, match] = ERROR_CODE_REGEX.exec(output) ?? [];
      if (match) {
        this.npmErrorCode = match;
        this.name += `.${this.npmErrorCode}`;
        break;
      }
    }
  }

  /**
   * Customized form for JSON.stringify() to avoid serializing possibly LARGE
   * contents of the `stdout` and `stderr` buffers.
   *
   * @internal
   */
  public toJSON() {
    return {
      name: this.name,
      message: this.message,
      stack: this.stack,
      npmErrorCode: this.npmErrorCode,
    };
  }
}
