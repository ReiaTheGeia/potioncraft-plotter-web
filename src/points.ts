export interface Point {
  x: number;
  y: number;
}

export const PointZero: Readonly<Point> = Object.freeze({ x: 0, y: 0 });

export function pointEquals(a: Point, b: Point): boolean {
  return (
    Math.abs(a.x - b.x) < Number.EPSILON && Math.abs(a.y - b.y) < Number.EPSILON
  );
}

export function pointScale(p: Point, factor: number): Point {
  return {
    x: p.x * factor,
    y: p.y * factor,
  };
}

export function pointMagnitude(p: Point): number {
  return Math.sqrt(p.x * p.x + p.y * p.y);
}

export function pointDistance(p1: Point, p2: Point) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function pointAdd(a: Point, b: Point) {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
  };
}

export function pointSubtract(a: Point, b: Point) {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
  };
}

export function pointNormalize(p: Point): Point {
  const magnitude = pointMagnitude(p);
  if (magnitude === 0) {
    return PointZero;
  }

  return {
    x: p.x / magnitude,
    y: p.y / magnitude,
  };
}

export function linearInterpolate(
  start: Point,
  end: Point,
  lerp: number
): Point {
  return {
    x: start.x + (end.x - start.x) * lerp,
    y: start.y + (end.y - start.y) * lerp,
  };
}
