import * as path from 'path';
import { Documentation, Language } from '../../../src';
import { ApiReferenceSchema, DocsSchema, PropertySchema } from '../../../src/docgen/schema';

const FIXTURE = path.join(__dirname, '..', '..', '__fixtures__', 'libraries', 'lib-with-doc-overrides');
const PKG = 'lib-with-doc-overrides';

// Only TypeScript, because other languages transliterate snippets with jsii-rosetta,
// which does not support the interface-member-doc-overrides feature yet.
let api: ApiReferenceSchema;
let markdown: string;
beforeAll(async () => {
  const docs = await Documentation.forProject(FIXTURE);
  try {
    const json = await docs.toJson({ language: Language.TYPESCRIPT });
    api = json.content.apiReference!;
    markdown = (await docs.toMarkdown({ language: Language.TYPESCRIPT })).render();
  } finally {
    await docs.cleanup();
  }
});

test('markdown of a struct with a re-declared property', () => {
  const start = markdown.indexOf('### ChildOptions');
  const end = markdown.indexOf('### GrandChildOptions');
  expect(markdown.slice(start, end)).toMatchSnapshot();
});

function structProperty(struct: string, property: string): PropertySchema {
  const found = api.structs.find((s) => s.fqn === `${PKG}.${struct}`)?.properties.find((p) => p.displayName === property);
  if (!found) {
    throw new Error(`Property ${struct}.${property} not found`);
  }
  return found;
}

function interfaceMember(iface: string, kind: 'properties' | 'instanceMethods', member: string): { docs: DocsSchema } {
  const found = api.interfaces.find((i) => i.fqn === `${PKG}.${iface}`)?.[kind].find((m) => m.displayName === member);
  if (!found) {
    throw new Error(`Member ${iface}.${member} not found`);
  }
  return found;
}

describe('struct properties', () => {
  test('a property that is not re-declared keeps the docs of the base', () => {
    const property = structProperty('ChildOptions', 'size');
    expect(property.default).toEqual('1');
    expect(property.docs.summary).toEqual('The size.');
  });

  test('a re-declared property uses its own docs', () => {
    const property = structProperty('ChildOptions', 'name');
    expect(property.default).toEqual('"child"');
    expect(property.docs.summary).toEqual('The name of the child.');
  });

  test('the base keeps its own docs', () => {
    const property = structProperty('BaseOptions', 'name');
    expect(property.default).toEqual('"base"');
    expect(property.docs.summary).toEqual('The name.');
  });

  test('an inherited property uses the docs of the nearest re-declaration', () => {
    const property = structProperty('GrandChildOptions', 'name');
    expect(property.default).toEqual('"child"');
    expect(property.docs.summary).toEqual('The name of the child.');
  });

  test('a property re-declared further down the chain uses its own docs', () => {
    const property = structProperty('GrandChildOptions', 'size');
    expect(property.default).toEqual('3');
    expect(property.docs.summary).toEqual('The size of the grand child.');
  });

  test('a re-declared property is listed once', () => {
    const struct = api.structs.find((s) => s.fqn === `${PKG}.GrandChildOptions`)!;
    expect(struct.properties.map((p) => p.displayName)).toEqual(['name', 'size']);
  });
});

describe('behavioral interfaces', () => {
  test('a re-declared property uses its own docs', () => {
    expect(interfaceMember('IGreeter', 'properties', 'greeting').docs.summary).toEqual('The greeting.');
    expect(interfaceMember('IPoliteGreeter', 'properties', 'greeting').docs.summary).toEqual('The polite greeting.');
  });

  test('a re-declared method uses its own docs', () => {
    const base = interfaceMember('IGreeter', 'instanceMethods', 'hello');
    expect(base.docs.summary).toEqual('Says hello.');
    expect(base.docs.deprecated).toBeUndefined();

    const child = interfaceMember('IPoliteGreeter', 'instanceMethods', 'hello');
    expect(child.docs.summary).toEqual('Says hello politely.');
    expect(child.docs.deprecated).toEqual(true);
    expect(child.docs.deprecationReason).toEqual('use `greeting` instead');
  });
});
