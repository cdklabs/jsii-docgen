import { MarkdownDocument } from '../../../src/docgen/render/markdown-doc';

describe('formatLinks', () => {
  test('URL only', () => {
    expect(MarkdownDocument.formatLinks('See {@link https://github.com/microsoft/tsdoc}.'))
      .toEqual('See [https://github.com/microsoft/tsdoc](https://github.com/microsoft/tsdoc).');
  });

  test('URL with custom link text', () => {
    expect(MarkdownDocument.formatLinks('Check out {@link https://example.com | the docs}.'))
      .toEqual('Check out [the docs](https://example.com).');
  });

  test('URL with custom link text without surrounding spaces', () => {
    expect(MarkdownDocument.formatLinks('{@link https://example.com|Example}'))
      .toEqual('[Example](https://example.com)');
  });

  test('mailto URL', () => {
    expect(MarkdownDocument.formatLinks('{@link mailto:foo@example.com | email us}'))
      .toEqual('[email us](mailto:foo@example.com)');
  });

  test('declaration reference renders as inline code', () => {
    expect(MarkdownDocument.formatLinks('See {@link Button} for details.'))
      .toEqual('See `Button` for details.');
  });

  test('declaration reference with member', () => {
    expect(MarkdownDocument.formatLinks('See {@link controls.Button.render}.'))
      .toEqual('See `controls.Button.render`.');
  });

  test('declaration reference with package path', () => {
    expect(MarkdownDocument.formatLinks('{@link @microsoft/my-control-library/lib/Button#Button}'))
      .toEqual('`@microsoft/my-control-library/lib/Button#Button`');
  });

  test('declaration reference with custom text renders as that text', () => {
    expect(MarkdownDocument.formatLinks('{@link Button | the Button class}'))
      .toEqual('the Button class');
  });

  test('multiple tags in one string', () => {
    expect(MarkdownDocument.formatLinks('{@link Button} and {@link https://example.com | here}'))
      .toEqual('`Button` and [here](https://example.com)');
  });

  test('the JSDoc space-delimited form is NOT treated as link text', () => {
    // TSDoc only uses `|` as the separator, so the trailing words are part of
    // the declaration reference target (rendered as inline code).
    expect(MarkdownDocument.formatLinks('{@link Button the Button class}'))
      .toEqual('`Button the Button class`');
  });

  test('the JSDoc prefix form is NOT supported', () => {
    // The bracket is left untouched; only the `{@link ...}` is converted.
    expect(MarkdownDocument.formatLinks('[the docs]{@link https://example.com}'))
      .toEqual('[the docs][https://example.com](https://example.com)');
  });

  test('malformed tag (no target) is left untouched', () => {
    expect(MarkdownDocument.formatLinks('an empty {@link } tag'))
      .toEqual('an empty {@link } tag');
  });

  test('malformed tag (no target before pipe) is left untouched', () => {
    expect(MarkdownDocument.formatLinks('{@link | text}'))
      .toEqual('{@link | text}');
  });

  test('text without any tags is unchanged', () => {
    expect(MarkdownDocument.formatLinks('plain text with no links'))
      .toEqual('plain text with no links');
  });
});
