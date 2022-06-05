export function windowArray<T>(array: T[], count: number): T[][] {
  const a = [...array];

  let result: T[][] = [];
  let window: T[] = [];

  while (a.length > 0) {
    window.push(a.pop()!);
    if (window.length === count) {
      result.push(window);
      window = [];
    }
  }

  if (window.length > 0) {
    result.push(window);
  }

  return result;
}

export function isNotNull<T>(x: T | null | undefined): x is T {
  return x != null;
}
