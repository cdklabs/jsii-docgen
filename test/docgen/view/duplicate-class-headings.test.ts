import * as path from 'path';
import { Documentation, Language } from '../../../src';
import { JsiiEntity } from '../../../src/docgen/schema';

const ASSEMBLIES_DIR = path.join(__dirname, '..', '..', '__fixtures__', 'duplicate-class-headings');

const headingLine = (markdown: string, className: string, submodule?: string): string => {
  const needle = submodule
    ? `### ${className} (${submodule})`
    : `### ${className} `;
  const line = markdown.split('\n').find((candidate) => candidate.startsWith(needle) && candidate.includes('<a '));
  if (!line) {
    throw new Error(`Expected heading for ${submodule ? `${submodule}.${className}` : className}, got:\n${markdown}`);
  }
  return line;
};

const renderAllSubmodules = async (anchorFormatter?: (type: JsiiEntity) => string) => {
  const docs = await Documentation.forAssembly('duplicate-class-headings', ASSEMBLIES_DIR);
  return docs.toMarkdown({
    language: Language.TYPESCRIPT,
    allSubmodules: true,
    anchorFormatter,
  });
};

test('same-named classes in different submodules get distinct headings on one page', async () => {
  const markdown = (await renderAllSubmodules()).render();

  const namespace1 = headingLine(markdown, 'SomeClass', 'namespace1');
  const namespace2 = headingLine(markdown, 'SomeClass', 'namespace2');

  expect(namespace1).toContain('name="namespace1.SomeClass"');
  expect(namespace2).toContain('name="namespace2.SomeClass"');
  expect(namespace1).toContain('id="duplicate-class-headings.namespace1.SomeClass"');
  expect(namespace2).toContain('id="duplicate-class-headings.namespace2.SomeClass"');

  // Unique-name control: a class that does not collide keeps its unqualified heading.
  const unique = headingLine(markdown, 'UniqueClass');
  expect(unique).toBe('### UniqueClass <a name="UniqueClass" id="duplicate-class-headings.UniqueClass"></a>');
  expect(markdown).not.toContain('### UniqueClass (');
});

test('custom anchor formatter still controls heading ids', async () => {
  const markdown = (await renderAllSubmodules((type) => `custom-${type.id}`)).render();

  const namespace1 = headingLine(markdown, 'SomeClass', 'namespace1');
  const namespace2 = headingLine(markdown, 'SomeClass', 'namespace2');
  const unique = headingLine(markdown, 'UniqueClass');

  expect(namespace1).toContain('id="custom-duplicate-class-headings.namespace1.SomeClass"');
  expect(namespace2).toContain('id="custom-duplicate-class-headings.namespace2.SomeClass"');
  expect(unique).toContain('id="custom-duplicate-class-headings.UniqueClass"');
  expect(unique).toContain('name="UniqueClass"');
});
