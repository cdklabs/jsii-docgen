import * as reflect from 'jsii-reflect';
import { defaultAnchorFormatter, Markdown } from '../render/markdown';
import { MethodSchema } from '../schema';
import { Transpile, TranspiledCallable } from '../transpile/transpile';
import { extractDocs } from '../util';
import { MarkdownRenderOptions } from './documentation';
import { Parameter } from './parameter';

export class StaticFunction {
  public static toMarkdown(
    method: MethodSchema,
    options: MarkdownRenderOptions,
  ) {
    const anchorFormatter = options.anchorFormatter ?? defaultAnchorFormatter;

    const md = new Markdown({
      id: anchorFormatter(method.id),
      header: {
        title: method.fqn.split('.').pop(),
        pre: true,
        strike: method.docs.deprecated,
      },
    });

    if (method.usage) {
      md.code(
        options.language.toString(),
        method.usage,
      );
    }

    for (const param of method.parameters) {
      md.section(Parameter.toMarkdown(param, options));
    }

    return md;
  }

  private readonly transpiled: TranspiledCallable;
  private readonly parameters: Parameter[];
  constructor(
    private readonly transpile: Transpile,
    private readonly method: reflect.Method,
  ) {
    this.transpiled = transpile.callable(method);
    this.parameters = this.transpiled.parameters.map(
      (p) => new Parameter(this.transpile, p),
    );
  }

  public toJson(): MethodSchema {
    return {
      fqn: `${this.transpiled.parentType.fqn}.${this.transpiled.name}`,
      id: `${this.method.parentType.fqn}.${this.method.name}`,
      parameters: this.parameters.map((param) => param.toJson()),
      docs: extractDocs(this.method.docs),
      usage: `${this.transpiled.import}\n\n${this.transpiled.invocations}`,
    };
  }
}
