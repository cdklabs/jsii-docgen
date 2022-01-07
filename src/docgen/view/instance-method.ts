import * as reflect from 'jsii-reflect';
import { defaultAnchorFormatter, MarkdownDocument } from '../render/markdown-doc';
import { MethodSchema } from '../schema';
import { Transpile, TranspiledCallable } from '../transpile/transpile';
import { extractDocs } from '../util';
import { MarkdownRenderContext } from './documentation';
import { Parameter } from './parameter';

export class InstanceMethod {
  public static toMarkdown(
    method: MethodSchema,
    context: MarkdownRenderContext,
  ): MarkdownDocument {
    const anchorFormatter = context.anchorFormatter ?? defaultAnchorFormatter;

    const md = new MarkdownDocument({
      id: anchorFormatter({
        id: method.id,
        displayName: method.displayName,
        fqn: method.fqn,
        packageName: context.packageName,
        packageVersion: context.packageVersion,
        submodule: context.submodule,
      }),
      header: {
        title: method.fqn.split('.').pop(),
        pre: true,
        strike: method.docs.deprecated,
      },
    });

    if (method.usage) {
      md.code(context.language.toString(), method.usage);
    }

    for (const param of method.parameters) {
      md.section(Parameter.toMarkdown(param, context));
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
      displayName: this.transpiled.name,
      id: `${this.method.definingType.fqn}.${this.method.name}`,
      parameters: this.parameters.map((p) => p.toJson()),
      docs: extractDocs(this.method.docs),
      usage: this.transpiled.signatures.join('\n'),
    };
  }
}
