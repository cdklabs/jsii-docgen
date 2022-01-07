import * as reflect from 'jsii-reflect';
import { defaultLinkFormatter, MarkdownDocument } from '../render/markdown-doc';
import { MethodSchema } from '../schema';
import { Transpile } from '../transpile/transpile';
import { MarkdownRenderContext } from './documentation';
import { InstanceMethod } from './instance-method';

export class InstanceMethods {
  public static toMarkdown(
    methods: MethodSchema[],
    context: MarkdownRenderContext,
  ): MarkdownDocument {
    if (methods.length === 0) {
      return MarkdownDocument.EMPTY;
    }

    const linkFormatter = context.linkFormatter ?? defaultLinkFormatter;

    const md = new MarkdownDocument({ header: { title: 'Methods' } });

    const tableRows: string[][] = [];
    tableRows.push(['Name', 'Description'].map(MarkdownDocument.bold));

    for (const method of methods) {
      const methodLink = MarkdownDocument.pre(linkFormatter({
        id: method.id,
        displayName: method.displayName,
        fqn: method.fqn,
        packageName: context.packageName,
        packageVersion: context.packageVersion,
        submodule: context.submodule,
      }));
      const methodDescription = method.docs?.summary && method.docs?.summary.length > 0
        ? method.docs?.summary
        : MarkdownDocument.italic('No description.');
      tableRows.push([methodLink, methodDescription]);
    }
    md.table(tableRows);
    md.split();

    for (const method of methods) {
      md.section(InstanceMethod.toMarkdown(method, context));
    }
    return md;
  }

  private readonly instanceMethods: InstanceMethod[];
  constructor(transpile: Transpile, methods: reflect.Method[]) {
    this.instanceMethods = methods
      .filter((m) => !m.protected && !m.static)
      .map((m) => new InstanceMethod(transpile, m));
  }

  public toJson(): MethodSchema[] {
    return this.instanceMethods.map((m) => m.toJson());
  }
}
