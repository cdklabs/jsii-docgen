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
export class NpmError<T = unknown> extends Error {
  /**
   * The name of this error.
   */
  public readonly name: string;

  /**
   * The error code npm printed out to stderr or stdout before exiting. This can
   * provide more information about the error in a machine-friendlier way.
   *
   * This is extracted from log-parsing, and is hence not guaranteed to be
   * accurate.
   *
   * @example 'EPROTO'
   * @example 'E429'
   * @example 'E404'
   */
  public readonly npmErrorCode: string | undefined;

  /**
   * Data the command produced to `STDOUT`.
   */
  public readonly stdout: T;

  /** @internal */
  public constructor(message: string, stdout: T, npmErrorCode?: string) {
    super(message);
    Error.captureStackTrace(this, this.constructor);

    this.stdout = stdout;
    this.npmErrorCode = npmErrorCode;

    this.name = `${name}.${this.constructor.name}${npmErrorCode ? `.${npmErrorCode}` : ''}`;
  }
}
