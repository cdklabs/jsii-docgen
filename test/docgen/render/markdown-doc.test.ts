import { MarkdownDocument } from '../../../src/docgen/render/markdown-doc';

describe('formatLinks', () => {
  test('URL only', () => {
    expect(MarkdownDocument.formatLinks('See {@link https://example.com}.'))
      .toEqual('See [https://example.com](https://example.com).');
  });

  test('URL with pipe-delimited link text', () => {
    expect(MarkdownDocument.formatLinks('Check out {@link http://www.google.com|Google}.'))
      .toEqual('Check out [Google](http://www.google.com).');
  });

  test('URL with space-delimited link text', () => {
    expect(MarkdownDocument.formatLinks('Check out {@link https://github.com GitHub}.'))
      .toEqual('Check out [GitHub](https://github.com).');
  });

  test('prefix bracket link text takes precedence', () => {
    expect(MarkdownDocument.formatLinks('[the docs]{@link https://example.com}'))
      .toEqual('[the docs](https://example.com)');
  });

  test('prefix bracket overrides inline text', () => {
    expect(MarkdownDocument.formatLinks('[prefix]{@link https://example.com|inline}'))
      .toEqual('[prefix](https://example.com)');
  });

  test('namepath reference renders as inline code', () => {
    expect(MarkdownDocument.formatLinks('See {@link MyClass} for details.'))
      .toEqual('See `MyClass` for details.');
  });

  test('namepath reference with member', () => {
    expect(MarkdownDocument.formatLinks("See [MyClass's foo property]{@link MyClass#foo}."))
      .toEqual("See `MyClass's foo property`.");
  });

  test('namepath reference with explicit text', () => {
    expect(MarkdownDocument.formatLinks('Use {@link MyClass#foo the foo prop} instead.'))
      .toEqual('Use `the foo prop` instead.');
  });

  test('linkcode renders URL text as inline code', () => {
    expect(MarkdownDocument.formatLinks('{@linkcode https://example.com Example}'))
      .toEqual('[`Example`](https://example.com)');
  });

  test('linkcode namepath renders as inline code', () => {
    expect(MarkdownDocument.formatLinks('{@linkcode MyClass}'))
      .toEqual('`MyClass`');
  });

  test('linkplain namepath renders as plain text', () => {
    expect(MarkdownDocument.formatLinks('{@linkplain MyClass the class}'))
      .toEqual('the class');
  });

  test('www. prefix gets an https scheme', () => {
    expect(MarkdownDocument.formatLinks('{@link www.example.com Example}'))
      .toEqual('[Example](https://www.example.com)');
  });

  test('mailto URL', () => {
    expect(MarkdownDocument.formatLinks('{@link mailto:foo@example.com email us}'))
      .toEqual('[email us](mailto:foo@example.com)');
  });

  test('multiple tags in one string', () => {
    expect(MarkdownDocument.formatLinks('{@link MyClass} and {@link https://example.com|here}'))
      .toEqual('`MyClass` and [here](https://example.com)');
  });

  test('malformed tag (no target) is left untouched', () => {
    expect(MarkdownDocument.formatLinks('an empty {@link } tag'))
      .toEqual('an empty {@link } tag');
  });

  test('text without any tags is unchanged', () => {
    expect(MarkdownDocument.formatLinks('plain text with no links'))
      .toEqual('plain text with no links');
  });

  test('bracket not adjacent to tag is not treated as prefix text', () => {
    expect(MarkdownDocument.formatLinks('[unrelated] and {@link https://example.com}'))
      .toEqual('[unrelated] and [https://example.com](https://example.com)');
  });
});
