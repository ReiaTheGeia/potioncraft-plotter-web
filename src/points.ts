import { clamp } from "lodash";

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

export function pointAngleRadians(from: Point, to: Point): number {
  return Math.atan2(to.y - from.y, to.x - from.x);
}

export function pointMoveTowards(
  current: Point,
  target: Point,
  maxDistanceDelta: number
): Point {
  const mt1 = target.x - current.x;
  const mt2 = target.y - current.y;
  const mt3 = mt1 * mt1 + mt2 * mt2;
  if (
    mt3 == 0.0 ||
    (maxDistanceDelta >= 0.0 && mt3 <= maxDistanceDelta * maxDistanceDelta)
  )
    return target;
  const mt4 = Math.sqrt(mt3);
  return {
    x: current.x + (mt1 / mt4) * maxDistanceDelta,
    y: current.y + (mt2 / mt4) * maxDistanceDelta,
  };
}

/**
 * Gets the smallest angle in degrees between two points.
 */
export function pointAngleDegrees180(from: Point, to: Point) {
  const num = Math.sqrt(
    (from.x * from.x + from.y * from.y) * (to.x * to.x + to.y * to.y)
  );
  if (num < Number.EPSILON) {
    return 0;
  }
  return Math.acos(clamp(pointDot(from, to) / num, -1, 1)) * 57.29578;
}

/**
 * Gets the smallest angle between to points.  Value will be negative if the angle if to is counterclockwise of from.
 */
export function pointSignedAngleDegrees180(from: Point, to: Point) {
  const a = pointAngleDegrees180(from, to);
  const sign = Math.sign(from.x * to.y - from.y * to.x);
  const sa = sign * a;
  return sa;
}

export function pointRotate(p: Point, angleInRadians: number): Point {
  const x = p.x * Math.cos(angleInRadians) - p.y * Math.sin(angleInRadians);
  const y = p.x * Math.sin(angleInRadians) + p.y * Math.cos(angleInRadians);
  return { x, y };
}

export function pointDot(a: Point, b: Point): number {
  return a.x * b.x + a.y * b.y;
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
