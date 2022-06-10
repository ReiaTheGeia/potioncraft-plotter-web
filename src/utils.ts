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

export function keepEveryK<T>(array: T[], k: number, keepLast = false) {
  if (array.length === 0) {
    return array;
  }

  const a = [];
  for (let i = 0; i < array.length; i += k) {
    a.push(array[i]);
  }
  if (keepLast && (array.length - 1) % k !== 0) {
    a.push(array[array.length - 1]);
  }
  return a;
}

export function isNotNull<T>(x: T | null | undefined): x is T {
  return x != null;
}

export function typedKeys<T>(obj: T): (keyof T)[] {
  return Object.keys(obj) as any;
}

export function degreesToRadians(degress: number): number {
  return (degress * Math.PI) / 180;
}
