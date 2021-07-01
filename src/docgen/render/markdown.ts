import * as reflect from 'jsii-reflect';

const sanitize = (input: string): string => {
  return input
    .toLowerCase()
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .replace(/ /g, '-');
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

    return sanitized;
  }

  public static bold(text: string): string {
    return `**${text}**`;
  }

  public static pre(text: string): string {
    return `\`${text}\``;
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
   * Render a `jsii-reflect.Docs` element into the markdown.
   */
  public docs(docs: reflect.Docs) {
    if (docs.summary) {
      this.lines(Markdown.sanitize(docs.summary));
      this.lines('');
    }
    if (docs.remarks) {
      this.lines(Markdown.sanitize(docs.remarks));
      this.lines('');
    }

    if (docs.docs.see) {
      this.quote(docs.docs.see);
    }

    const customLink = docs.customTag('link');
    if (customLink) {
      this.quote(`[${customLink}](${customLink})`);
    }
  }

  public quote(line: string) {
    this.lines(`> ${line}`);
    this.lines('');
  }

  public bullet(line: string) {
    this.lines(`- ${line}`);
  }

  public code(language: string, ...snippet: string[]) {
    this.lines(`\`\`\`${language}`, ...snippet, '```');
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
      const anchor = sanitize(this.id ?? '');
      const heading = `${'#'.repeat(headerSize)} ${this.header}`;
      const headerSpan = !!process.env.HEADER_SPAN;

      // This is nasty, i'm aware.
      // Its just an escape hatch so that produce working links by default, but also support producing the links that construct-hub currently relies on.
      // This will be gone soon.
      // Note though that cross links (i.e links dependencies will not work yet regardless)

      console.log(`Header span: ${headerSpan}`);
      if (headerSpan) {
        content.push(
          `${heading} <span data-heading-title="${this.header}" data-heading-id="${anchor}"></span>`,
        );
      } else {
        content.push(`${heading} <a name="${this.id}"></a>`);
      }
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
}
