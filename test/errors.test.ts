import { NoSpaceLeftOnDevice, TransliterationError } from '../src';

function throwSite(create: () => Error) {
  return create();
}

test.each([
  ['DocGenError subclass', 'jsii-docgen.TransliterationError', () => new TransliterationError('boom')],
  ['NoSpaceLeftOnDevice', 'jsii-docgen.NoSpaceLeftOnDevice', () => new NoSpaceLeftOnDevice('boom')],
])('%s has a stack trace that starts at the throw site', (_, errorName, create) => {
  const stack = throwSite(create).stack?.split('\n') ?? [];
  expect(stack[0]).toEqual(`${errorName}: boom`);
  expect(stack.slice(1).join('\n')).toContain('throwSite');
  expect(stack.slice(1).join('\n')).not.toMatch(/new (DocGenError|TransliterationError|NoSpaceLeftOnDevice)/);
});
