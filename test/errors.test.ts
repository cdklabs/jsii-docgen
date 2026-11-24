import { NoSpaceLeftOnDevice, TransliterationError } from '../src';

test.each([
  ['DocGenError subclass', () => new TransliterationError('boom')],
  ['NoSpaceLeftOnDevice', () => new NoSpaceLeftOnDevice('boom')],
])('%s keeps a stack trace that includes the message', (_, create) => {
  const error = create();
  expect(error.message).toEqual('boom');
  expect(error.stack).toBeDefined();
  expect(error.stack).toContain('boom');
});

test('uses the given stack when provided', () => {
  const error = new NoSpaceLeftOnDevice('boom', 'custom stack');
  expect(error.stack).toEqual('custom stack');
});
