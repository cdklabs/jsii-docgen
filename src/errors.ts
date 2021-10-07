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
