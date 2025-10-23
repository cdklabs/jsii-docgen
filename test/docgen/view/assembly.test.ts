import { bestAssemblyMatch, AssemblyLookup } from '../../../src/docgen/view/assembly';

describe('bestAssemblyMatch', () => {
  const assemblies: AssemblyLookup = {
    'test-lib@1.0.0': { name: 'test-lib', version: '1.0.0', path: '/path/1.0.0' },
    'test-lib@1.1.0': { name: 'test-lib', version: '1.1.0', path: '/path/1.1.0' },
    'test-lib@1.2.0': { name: 'test-lib', version: '1.2.0', path: '/path/1.2.0' },
    'test-lib@2.0.0': { name: 'test-lib', version: '2.0.0', path: '/path/2.0.0' },
    'other-lib@1.0.0': { name: 'other-lib', version: '1.0.0', path: '/path/other' },
  };

  test('returns undefined for non-existent assembly', () => {
    expect(bestAssemblyMatch(assemblies, 'missing@1.0.0')).toBeUndefined();
  });

  test('returns exact version match', () => {
    const result = bestAssemblyMatch(assemblies, 'test-lib@1.1.0');
    expect(result?.version).toBe('1.1.0');
  });

  test('returns highest version when no constraint', () => {
    const result = bestAssemblyMatch(assemblies, 'test-lib');
    expect(result?.version).toBe('2.0.0');
  });

  test('returns semver compatible version', () => {
    const result = bestAssemblyMatch(assemblies, 'test-lib@^1.0.0');
    expect(result?.version).toBe('1.2.0');
  });

  test('returns major version match when semver fails', () => {
    const result = bestAssemblyMatch(assemblies, 'test-lib@1.5.0');
    expect(result?.version).toBe('1.2.0');
  });

  test('returns highest version when all constraints fail', () => {
    const result = bestAssemblyMatch(assemblies, 'test-lib@3.0.0');
    expect(result?.version).toBe('2.0.0');
  });

  test('handles scoped packages correctly', () => {
    const scopedAssemblies: AssemblyLookup = {
      '@aws-cdk/core@1.0.0': { name: '@aws-cdk/core', version: '1.0.0', path: '/path/1.0.0' },
      '@aws-cdk/core@1.1.0': { name: '@aws-cdk/core', version: '1.1.0', path: '/path/1.1.0' },
      '@aws-cdk/core@2.0.0': { name: '@aws-cdk/core', version: '2.0.0', path: '/path/2.0.0' },
    };

    const result = bestAssemblyMatch(scopedAssemblies, '@aws-cdk/core@^1.0.0');
    expect(result?.version).toBe('1.1.0');
    expect(result?.name).toBe('@aws-cdk/core');
  });
});
