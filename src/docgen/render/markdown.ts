import { DocsSchema, TypeSchema } from '../schema';

const sanitize = (input: string): string => {
  return input
    .toLowerCase()
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .replace(/ /g, '-');
};

export const anchorForId = (id: string): string => {
  return sanitize(id);
};

/**
 * Options for defining a markdown header.
 */
export interface MarkdownHeaderOptions {
  /**
   * Title to be displayed.
   */
  readonly title?: string;

  /**
   * Superscript.
   *
   * @default - No superscript
   */
  readonly sup?: string;

  /**
   * Preformat the header.
   *
   * @default false
   */
  readonly pre?: boolean;

  /**
   * Strikethough the title.
   *
   * @default false
   */
  readonly strike?: boolean;
}

/**
 * Options for defining a markdown element.
 */
export interface MarkdownOptions {
  /**
   * Markdown header.
   *
   * @default - No header.
   */
  readonly header?: MarkdownHeaderOptions;

  /**
   * Id of the element.
   *
   * @default - The title will be used.
   */
  readonly id?: string;
}

/**
 * Markdown element.
 */
export class Markdown {
  /**
   * An empty markdown element.
   */
  public static readonly EMPTY = new Markdown();

  /**
   * Sanitize markdown reserved characters from external input.
   */
  public static sanitize(line: string): string {
    let sanitized = line.trim();

    if (line.startsWith('-')) {
      sanitized = sanitized.substring(1, line.length).trim();
    }

    sanitized = sanitized.replace(/\n/g, ' ');

    return sanitized;
  }

  public static bold(text: string): string {
    return `**${text}**`;
  }

  public static pre(text: string): string {
    // using <code> instead of backticks since this allows links
    return `<code>${text}</code>`;
  }

  public static italic(text: string) {
    return `*${text}*`;
  }

  private readonly _lines = new Array<string>();
  private readonly _sections = new Array<Markdown>();

  private readonly id?: string;
  private readonly header?: string;

  constructor(private readonly options: MarkdownOptions = {}) {
    this.id = options.id ?? options.header?.title;
    this.header = this.formatHeader();
  }

  /**
   * Render a docs element into the markdown.
   */
  public docs(docs: DocsSchema) {
    if (docs.summary) {
      this.lines(Markdown.sanitize(docs.summary));
      this.lines('');
    }
    if (docs.remarks) {
      this.lines(Markdown.sanitize(docs.remarks));
      this.lines('');
    }

    if (docs.see) {
      this.quote(docs.see);
    }

    if (docs.see) {
      this.quote(`[${docs.see}](${docs.see})`);
    }
  }

  public table(data: string[][]) {
    const numColumns = data[0].length;
    const header = data[0];
    const rows = data.slice(1);
    this.lines('| ' + header.map(this.escapePipes).join(' | ') + ' |');
    this.lines('|' + ' --- |'.repeat(numColumns));
    for (const row of rows) {
      this.lines('| ' + row.map(this.escapePipes).join(' | ') + ' |');
    }
    this.lines('');
  }

  public quote(line: string) {
    this.lines(`> ${line}`);
    this.lines('');
  }

  public bullet(line: string) {
    this.lines(`- ${line}`);
  }

  public code(language: string, ...snippet: string[]) {
    this.lines(`<pre lang="${language}">`, ...snippet, '</pre>');
    this.lines('');
  }

  public lines(...lines: string[]) {
    this._lines.push(...lines);
  }

  public split() {
    this.lines('---');
    this.lines('');
  }

  public section(section: Markdown) {
    this._sections.push(section);
  }

  public render(headerSize: number = 0): string {
    if (headerSize > 6) {
      // headers are mapped to `h1-h6` html elements.
      // passed that, markdown just renders `#` signs.
      // lets see if and when we'll hit this limit.
      throw new Error('Unable to render markdown. Header limit (6) reached.');
    }

    const content: string[] = [];
    if (this.header) {
      const heading = `${'#'.repeat(headerSize)} ${this.header}`;
      content.push(`${heading} <a id="${this.id}"></a>`);
      content.push('');
    }

    for (const line of this._lines) {
      content.push(`${line}`);
    }

    for (const section of this._sections) {
      content.push(section.render(headerSize + 1));
    }
    return content.join('\n');
  }

  private formatHeader(): string | undefined {
    if (!this.options.header?.title) {
      return undefined;
    }
    let caption = this.options.header.title;

    if (this.options.header?.pre ?? false) {
      caption = `\`${caption}\``;
    }

    if (this.options.header?.strike ?? false) {
      caption = `~~${caption}~~`;
    }

    if (this.options.header?.sup) {
      caption = `${caption}<sup>${this.options.header?.sup}</sup>`;
    }

    return caption;
  }

  private escapePipes(line: string): string {
    return line.replace(/\|/g, '\\|');
  }
}

export const defaultAnchorFormatter = (id: string) => {
  return id;
};

export const defaultLinkFormatter = (fqn: string, id: string) => {
  const name = fqn.split('.').pop()!;
  return `<a href="#${id}">${name}</a>`;
};

export const defaultTypeFormatter = (
  type: TypeSchema,
  linkFormatter: (fqn: string, id: string) => string,
): string => {
  // if type is of the form `{ fqn, id }`, display it directly
  if (type.fqn) {
    return linkFormatter(type.fqn, type.id!);
  }

  // else, type is of the form `{ name, types? }`
  let result = type.name!;
  const typeRefs = [];
  for (const typeRef of type.types ?? []) {
    typeRefs.push(defaultTypeFormatter(typeRef, linkFormatter));
  }

  // substitute referred types into the original string
  const placeholderMatcher = /\%/g;
  for (const typeRef of typeRefs) {
    const matches = placeholderMatcher.exec(result);
    if (!matches) {
      // it's possible the number of %'s doesn't match the number of types provided
      // e.g. csharp unions are currently rendered to `{ name: 'object', types: [type1, type2] }`
      continue;
    }
    const insertionIdx: number = matches.index;
    result = result.substring(0, insertionIdx) + typeRef + result.substring(insertionIdx + 1);
  }

  return result;
};
