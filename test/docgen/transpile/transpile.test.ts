import { Language } from '../../../src/docgen/transpile/transpile';

describe('language', () => {

  test('typescript is supported', () => {
    expect(Language.fromLiteral('typescript')).toEqual(Language.TYPESCRIPT);
  });

  test('python is supported', () => {
    expect(Language.fromLiteral('python')).toEqual(Language.PYTHON);
  });

  test('throw error on unsupported language', () => {
    expect(() => Language.fromLiteral('unsupported')).toThrowError('Unsupported language: unsupported. Supported languages are: [typescript,python]');
  });

  test('toString()', () => {
    expect(Language.PYTHON.toString()).toEqual('python');
  });

});