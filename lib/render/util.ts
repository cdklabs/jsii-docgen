import * as jsiiReflect from 'jsii-reflect';

export function compareByKeys<T>(keyExtractor: (x: T) => any[]): ((a: T, b: T) => number) {
  return (A, B) => {
    const a = keyExtractor(A);
    const b = keyExtractor(B);

    let i = 0;
    while (i < a.length && i < b.length) {
      if (a[i] < b[i]) { return -1; }
      if (a[i] > b[i]) { return 1; }

      i += 1;
    }
    return a.length - b.length;
  };
}

export function flatMap<T, U>(xs: readonly T[], fn: (value: T, index: number, array: readonly T[]) => U[]): U[] {
  return Array.prototype.concat(...xs.map(fn));
}

export function isStatic(x: jsiiReflect.Callable) {
  return x instanceof jsiiReflect.Method && x.static;
}
