import { Readable } from 'node:stream';
import { JsonStreamStringify } from 'json-stream-stringify';

export interface JsonFormattingOptions {
  /**
   * The number of spaces to use for indentation.
   *
   * @default 2
   */
  readonly spaces?: number;
}

/**
 * Type-safe Json renderer.
 */
export class Json<T> {
  private opts: Required<JsonFormattingOptions>;

  constructor(public readonly content: T, opts: JsonFormattingOptions = {}) {
    this.opts = defaultOpts(opts);
  };

  public render(): string {
    return JSON.stringify(this.content, null, this.opts.spaces);
  }

  public stream(): Readable {
    return new JsonStreamStringify(this.content, undefined, this.opts.spaces);
  }
}

function defaultOpts(opts: JsonFormattingOptions = {}): Required<JsonFormattingOptions> {
  return {
    spaces: opts.spaces ?? 2,
  };
};
