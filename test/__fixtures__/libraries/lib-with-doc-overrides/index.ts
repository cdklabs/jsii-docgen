export interface BaseOptions {
  /**
   * The name.
   *
   * @default "base"
   */
  readonly name?: string;

  /**
   * The size.
   *
   * @default 1
   */
  readonly size?: number;
}

export interface ChildOptions extends BaseOptions {
  /**
   * The name of the child.
   *
   * @default "child"
   */
  readonly name?: string;
}

export interface GrandChildOptions extends ChildOptions {
  /**
   * The size of the grand child.
   *
   * @default 3
   */
  readonly size?: number;
}

export interface IGreeter {
  /**
   * The greeting.
   */
  readonly greeting: string;

  /**
   * Says hello.
   */
  hello(name: string): string;
}

export interface IPoliteGreeter extends IGreeter {
  /**
   * The polite greeting.
   */
  readonly greeting: string;

  /**
   * Says hello politely.
   *
   * @deprecated use `greeting` instead
   */
  hello(name: string): string;
}

export class Greeter implements IPoliteGreeter {
  public readonly greeting: string;

  public constructor(options: GrandChildOptions = {}) {
    this.greeting = `Hello from ${options.name ?? 'grand child'}`;
  }

  public hello(name: string): string {
    return `${this.greeting}, ${name}`;
  }
}
