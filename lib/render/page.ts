import jsiiReflect = require('jsii-reflect');
import { Stability } from 'jsii-spec';
import { isStatic } from './util';

export type JsiiEntity = jsiiReflect.Type | jsiiReflect.Assembly;

export interface ILinkRenderer {
  renderLink(type: JsiiEntity): string;
  renderFileName(type: JsiiEntity): string;
}

export interface PageOptions {
  linkRenderer?: ILinkRenderer;
}

export class MarkdownLinkRenderer implements ILinkRenderer {
  public renderLink(type: JsiiEntity): string {
    return `./${this.renderFileName(type)}`;
  }

  public renderFileName(type: JsiiEntity): string {
    return type.fqn.replace('/', '_') + '.md';
  }
}

export interface RenderContext {
  readonly links: ILinkRenderer;
}

export abstract class Page {
  constructor(protected readonly ctx: RenderContext, public readonly type: JsiiEntity) {

  }

  public get fileName() {
    return this.ctx.links.renderFileName(this.type);
  }

  public abstract render(): string[];

  protected renderDefault(x: string = '') {
    x = x.trim();
    if (x.startsWith('- ')) { x = x.substr(2); }
    x = x.trim();
  
    if (x) {
      return `*Default*: ` + x;
    } else {
      return `*Optional*`
    }
  }

  protected renderStability(x: jsiiReflect.Documentable): string {
    switch (x.docs.stability) {
      case Stability.Stable: return '';
      case Stability.Experimental: return mkIcon('🔹', `This API element is experimental. It may change without notice.`, 'experimental');
      case Stability.Deprecated: return mkIcon('⚠️', `This API element is deprecated. Its use is not recommended.`, 'deprecated');
    }
    return '';
  }
  
  protected elementAnchor(type: jsiiReflect.Callable | jsiiReflect.Property) {
    return `#${this.elementAnchorId(type)}`;
  }

  protected elementAnchorId(type: jsiiReflect.Callable | jsiiReflect.Property) {
    let sig;
    if (type instanceof jsiiReflect.Callable) {
      sig = this.methodSignature(type);
    } else {
      sig = type.name;
    }

    return `${sig.replace(/\ /g, '-').replace(/[^A-Za-z-]/g, '')}`;
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
  
    const visibility = method.protected ? 'protected ' : 'public ';
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
      return `new ${method.parentType.name}(${parameters})`;
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
    const methodLink = typeLink + this.elementAnchor(method);
    return `[${type.name}](${typeLink}).[${method.name}](${methodLink})()`;
  }

  /**
   * Turn the given type into a link
   */
  protected typeLink(type: jsiiReflect.Type): string {
    const display = type.name;
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

function mkIcon(icon: string, tooltip: string, badgeType: string) {
  return `<span class="api-icon api-icon-${badgeType}" title="${htmlEncode(tooltip)}">${icon}</span>`;
}

function htmlEncode(x: string) {
  return x.replace(/[\u00A0-\u9999<>\&]/gim, i => '&#' + i.charCodeAt(0) + ';');
}

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
