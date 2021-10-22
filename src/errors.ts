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
  public readonly stdout: Buffer;

  /**
   * Data the command produced to `STDERR`. This field is not included in the
   * `JSON.stringify()` output for this type.
   */
  public readonly stderr: Buffer;

  /** @internal */
  public constructor(message: string, stdio: { stdout: readonly Buffer[]; stderr: readonly Buffer[] }) {
    super(message);
    Error.captureStackTrace(this, this.constructor);

    this.stdout = Buffer.concat(stdio.stdout);
    this.stderr = Buffer.concat(stdio.stderr);

    this.name = `${name}.${this.constructor.name}`;

    const ERROR_CODE_REGEX = /^npm\s+ERR!\s+(?:code|errno)\s+(E[^\s]+|\d+)$/gm;
    for (const output of [...linesFrom(this.stderr), ...linesFrom(this.stdout)]) {
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

/**
 * Extracts lines from a buffer individually within stringifying the whole
 * buffer at once (so the buffer can be longer than the maximum string that can
 * be obtained from a Buffer).
 *
 * @param buffer the buffer from which to read lines.
 *
 * @returns the lines of text contained in the buffer.
 */
function linesFrom(buffer: Buffer): string[] {
  const lines = new Array<string>();
  while (buffer.length > 0) {
    const { pos, len } = firstLineBreak(buffer);
    if (pos < 0) {
      // We did not find a line break, so flush the rest of the string.
      lines.push(buffer.toString('utf8'));
      buffer = buffer.slice(buffer.length);
    } else {
      // We found a line, so extracting it and moving forward.
      lines.push(buffer.slice(0, pos).toString('utf-8'));
      buffer = buffer.slice(pos + len);
    }
  }
  return lines;
}

function firstLineBreak(buffer: Buffer) {
  const crlf = buffer.indexOf('\r\n');
  if (crlf >= 0) {
    return { pos: crlf, len: 2 };
  }
  const cr = buffer.indexOf('\r');
  if (cr >= 0) {
    return { pos: cr, len: 1 };
  }
  const lf = buffer.indexOf('\n');
  return { pos: lf, len: lf < 0 ? 0 : 1 };
}
