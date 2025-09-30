export interface IFoo {
  readonly foo: string;
}

export interface IBar {
  bar(x: string): string;
}

export interface Props {
  readonly input: IFoo & IBar;
}

export class FooBer implements IFoo, IBar {
  public readonly foo: string = 'foo';

  public bar(x: string) {
    return `BAR${x}BAR`;
  }
}

export class Hello {
  public static useStatic(param: IFoo & IBar) {
    return param.bar(param.foo);
  }

  public use(param: IFoo & IBar) {
    return param.bar(param.foo);
  }

  public useProps(props: Props) {
    return props.input.bar(props.input.foo);
  }
}