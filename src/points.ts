import { clamp } from "lodash";

export interface Vector2 {
  x: number;
  y: number;
}

export const Vec2Zero: Readonly<Vector2> = Object.freeze({ x: 0, y: 0 });

export function vec2Equals(a: Vector2, b: Vector2): boolean {
  return (
    Math.abs(a.x - b.x) < Number.EPSILON && Math.abs(a.y - b.y) < Number.EPSILON
  );
}

export function vec2Scale(p: Vector2, factor: number): Vector2 {
  return {
    x: p.x * factor,
    y: p.y * factor,
  };
}

export function vec2Magnitude(p: Vector2): number {
  return Math.sqrt(p.x * p.x + p.y * p.y);
}

export function vec2AngleRadians(from: Vector2, to: Vector2): number {
  return Math.atan2(to.y - from.y, to.x - from.x);
}

export function vec2MoveTowards(
  current: Vector2,
  target: Vector2,
  maxDistanceDelta: number
): Vector2 {
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
export function vec2AngleDegrees180(from: Vector2, to: Vector2) {
  const num = Math.sqrt(
    (from.x * from.x + from.y * from.y) * (to.x * to.x + to.y * to.y)
  );
  if (num < Number.EPSILON) {
    return 0;
  }
  return Math.acos(clamp(vec2Dot(from, to) / num, -1, 1)) * 57.29578;
}

/**
 * Gets the smallest angle between to points.  Value will be negative if the angle if to is counterclockwise of from.
 */
export function pointSignedAngleDegrees180(from: Vector2, to: Vector2) {
  const a = vec2AngleDegrees180(from, to);
  const sign = Math.sign(from.x * to.y - from.y * to.x);
  const sa = sign * a;
  return sa;
}

export function vec2Rotate(p: Vector2, angleInRadians: number): Vector2 {
  const x = p.x * Math.cos(angleInRadians) - p.y * Math.sin(angleInRadians);
  const y = p.x * Math.sin(angleInRadians) + p.y * Math.cos(angleInRadians);
  return { x, y };
}

export function vec2Dot(a: Vector2, b: Vector2): number {
  return a.x * b.x + a.y * b.y;
}

export function vec2Distance(p1: Vector2, p2: Vector2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function vec2Add(a: Vector2, b: Vector2) {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
  };
}

export function vec2Subtract(a: Vector2, b: Vector2) {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
  };
}

export function vec2Normalize(p: Vector2): Vector2 {
  const magnitude = vec2Magnitude(p);
  if (magnitude === 0) {
    return Vec2Zero;
  }

  return {
    x: p.x / magnitude,
    y: p.y / magnitude,
  };
}

export function vec2Lerp(start: Vector2, end: Vector2, lerp: number): Vector2 {
  return {
    x: start.x + (end.x - start.x) * lerp,
    y: start.y + (end.y - start.y) * lerp,
  };
}
