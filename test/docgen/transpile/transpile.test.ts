import { Language } from '../../../src/docgen/transpile/transpile';

describe('language', () => {

  test('typescript is supported', () => {
    expect(Language.fromString('typescript')).toEqual(Language.TYPESCRIPT);
  });

  test('python is supported', () => {
    expect(Language.fromString('python')).toEqual(Language.PYTHON);
  });

  test('java is supported', () => {
    expect(Language.fromString('java')).toEqual(Language.JAVA);
  });

  test('throw error on unsupported language', () => {
    expect(() => Language.fromString('unsupported')).toThrowError(/Unsupported language: unsupported. Supported languages are/);
  });

  test('toString()', () => {
    expect(Language.PYTHON.toString()).toEqual('python');
  });

});