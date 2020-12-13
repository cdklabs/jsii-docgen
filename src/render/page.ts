import { Stability } from '@jsii/spec';
import * as jsiiReflect from 'jsii-reflect';
import { elementAnchorLink, elementAnchor } from './links';
import { isStatic } from './util';

export type JsiiEntity = jsiiReflect.Type | jsiiReflect.Assembly;

export interface ILinkRenderer {
  renderLink(type: JsiiEntity): string;
}

export interface RenderContext {
  /**
   * Links rennderer
   */
  readonly links: ILinkRenderer;

  /**
   * Include the contents of the module's README in the module home page
   * @default true
   */
  readonly readme?: boolean;

  /**
   * Heading level for page titles.
   * @default 1
   */
  readonly heading?: number;
}

export abstract class Page {
  constructor(protected readonly ctx: RenderContext, public readonly type: JsiiEntity, public readonly title?: string) {

  }

  /**
   * Returns the page markdown.
   */
  public get markdown() {
    const lines = new Array<string>();
    if (this.title) {
      lines.push(this.headingA(`${this.title} ${this.renderStability(this.type)} ${elementAnchor(this.type)}`));
    }

    lines.push(...this.render());

    return lines.map(x => x ?? '').join('\n');
  }

  protected abstract render(): string[];

  protected renderDefault(x: string = '') {
    x = x.replace(/\n/g, ' ');
    x = x.trim();
    if (x.startsWith('- ')) { x = x.substr(2); }
    x = x.trim();

    if (x) {
      return this.strong(this.italic('Default')) + ': ' + x;
    } else {
      return this.strong(this.italic('Optional'));
    }
  }

  protected renderStability(x: jsiiReflect.Documentable | jsiiReflect.Assembly): string {
    const stability = 'docs' in x ? x.docs.stability : Stability.Stable;
    switch (stability) {
      case Stability.Stable: return '';
      case Stability.Experimental: return mkIcon('🔹', 'This API element is experimental. It may change without notice.');
      case Stability.Deprecated: return mkIcon('⚠️', 'This API element is deprecated. Its use is not recommended.');
    }
    return '';
  }

  protected headingA(caption?: string) {
    return this.heading(caption, 1);
  }

  protected headingB(caption?: string) {
    return this.heading(caption, 2);
  }

  protected headingC(caption?: string) {
    return this.heading(caption, 3);
  }

  private heading(caption: string | undefined, level: number) {
    if (!caption) { return ''; }
    const number = this.ctx.heading ?? 1;
    const heading = '#'.repeat(number + level - 1);
    return `${heading} ${caption}\n`;
  }

  protected strong(text: string) {
    return `__${text}__`;
  }

  protected italic(text: string) {
    return `*${text}*`;
  }

  protected renderElementName(name: string) {
    return `**${name}**`;
  }

  /**
   * Render a table row out of a set of cells
   *
   * Fill the table row with something if there's no text, otherwise it will be
   * rendered uglily.
   */
  protected tableRow(...cells: string[]) {
    return cells.map(c => c.trim()).map(c => c ? c.replace(/\n/, ' ') : '<span></span>').join(' | ');
  }

  protected methodSignature(method: jsiiReflect.Callable, options: SignatureOptions = {}) {
    const self = this;
    const name = method.name;

    const visibility = method.protected ? 'protected ' : '';
    const paramRenderer = options.long ? fullParam : shortParam;
    const parameters = method.parameters.map(paramRenderer).join(', ');
    const returnDecl = options.long && method instanceof jsiiReflect.Method ? ': ' + this.formatTypeSimple(method.returns.type) : '';
    let staticDecl = '';
    if (isStatic(method)) {
      if (!options.long) {
        staticDecl = '*static* ';
      } else {
        staticDecl += 'static ';
      }
    }
    const showVisibility = options.long || method.protected;

    if (method instanceof jsiiReflect.Initializer) {
      const qualifiedName = method.parentType.namespace
        ? `${method.parentType.namespace}.${method.parentType.name}`
        : method.parentType.name;
      return `new ${qualifiedName}(${parameters})`;
    } else {
      return `${showVisibility ? visibility : ''}${staticDecl}${name}(${parameters})${returnDecl}`;
    }

    function fullParam(p: jsiiReflect.Parameter) {
      return `${p.variadic ? '...' : ''}${p.name}${p.optional ? '?' : ''}: ${self.formatTypeSimple(p.type)}${p.variadic ? '[]' : ''}`;
    }

    function shortParam(p: jsiiReflect.Parameter) {
      return `${p.variadic ? '...' : ''}${p.name}${p.optional ? '?' : ''}`;
    }
  }

  protected methodLink(method: jsiiReflect.Method) {
    const type = method.parentType;
    const typeLink = this.ctx.links.renderLink(type);
    const methodLink = typeLink + elementAnchorLink(method);
    return `[${type.name}](${typeLink}).[${method.name}](${methodLink})()`;
  }

  /**
   * Turn the given type into a link
   */
  protected typeLink(type: jsiiReflect.Type): string {
    const display = type.namespace ? `${type.namespace}.${type.name}` : type.name;
    const url = this.ctx.links.renderLink(type);

    if (!url) {
      return display;
    }

    return `[${display}](${url})`;
  }

  /**
   * Turn the given type reference into a link
   */
  protected typeReferenceLink(reference: jsiiReflect.TypeReference): string {
    return '<code>' + this.typeReference(reference, type => this.typeLink(type)) + '</code>';
  }

  private formatTypeSimple(reference: jsiiReflect.TypeReference): string {
    return this.typeReference(reference, type => type.name);
  }

  private typeReference(reference: jsiiReflect.TypeReference, userTypeFormatter: TypeFormatter): string {
    if (reference.unionOfTypes) {
      return reference.unionOfTypes.map(ref => this.typeReference(ref, userTypeFormatter)).join(' &#124; ');
    } else if (reference.primitive) {
      return reference.primitive;
    } else if (reference.arrayOfType) {
      return `Array<${this.typeReference(reference.arrayOfType, userTypeFormatter)}>`;
    } else if (reference.mapOfType) {
      return `Map<string, ${this.typeReference(reference.mapOfType, userTypeFormatter)}>`;
    } else if (reference.void) {
      return 'void';
    }

    let type: jsiiReflect.Type;
    try {
      type = reference.type!;
    } catch (e) {
      return JSON.stringify((reference as any).spec);
    }

    return userTypeFormatter(type);
  }

}

function mkIcon(icon: string, _tooltip: string) {
  // return `<span title="${htmlEncode(tooltip)}">${icon}</span>`;
  return icon;
}

// function htmlEncode(x: string) {
//   return x.replace(/[\u00A0-\u9999<>\&]/gim, i => '&#' + i.charCodeAt(0) + ';');
// }

export interface SignatureOptions {
  /**
   * Whether to use the full signature
   *
   * @default false
   */
  long?: boolean;

  /**
   * Whether the signature is rendered in verbatim text
   *
   * In verbatim mode we won't hyphenate the text as it will lead
   * to <wbr>s in code blocks.
   */
  verbatim?: boolean;
}

type TypeFormatter = (t: jsiiReflect.Type) => string;
