import { last } from "lodash";
import {
  BEZIER_CURVE_LENGTH_RESOLUTION,
  PATH_SPACING_PHYSICS,
} from "./game-settings";

import {
  Vector2,
  vec2Add,
  vec2Distance,
  vec2Magnitude,
  vec2Normalize,
  vec2Scale,
  vec2Subtract,
} from "./vector2";

export interface CubicBezierCurve {
  start: Vector2;
  p1: Vector2;
  p2: Vector2;
  end: Vector2;
}

export function cubicBezierCurve(
  startX: number,
  startY: number,
  p1x: number,
  p1y: number,
  p2x: number,
  p2y: number,
  endx: number,
  endy: number
): CubicBezierCurve {
  return {
    start: { x: startX, y: startY },
    p1: { x: p1x, y: p1y },
    p2: { x: p2x, y: p2y },
    end: { x: endx, y: endy },
  };
}

export function getCurvePoint(curve: CubicBezierCurve, t: number): Vector2 {
  if (t < 0 || t > 1) {
    throw new Error("getPoint: t must be between 0 and 1");
  }

  const b1 = (1 - t) * (1 - t) * (1 - t);
  const b2 = 3 * t * (1 - t) * (1 - t);
  const b3 = 3 * t * t * (1 - t);
  const b4 = t * t * t;

  return {
    x:
      b1 * curve.start.x + b2 * curve.p1.x + b3 * curve.p2.x + b4 * curve.end.x,
    y:
      b1 * curve.start.y + b2 * curve.p1.y + b3 * curve.p2.y + b4 * curve.end.y,
  };
}

const curveLengthCache = new Map<CubicBezierCurve, number>();
export function getCurveLength(curve: CubicBezierCurve): number {
  const cached = curveLengthCache.get(curve);
  if (cached !== undefined) {
    return cached;
  }

  const resolution = BEZIER_CURVE_LENGTH_RESOLUTION;

  let length = 0.0;
  let prevPoint = getCurvePoint(curve, 0);
  for (let index = 1; index <= resolution; ++index) {
    const point = getCurvePoint(curve, index / resolution);
    const offset = vec2Subtract(point, prevPoint);
    length += vec2Magnitude(offset);
    prevPoint = point;
  }

  curveLengthCache.set(curve, length);

  return length;
}

const curvesToPointsCache = new Map<CubicBezierCurve[], Vector2[]>();
export function curvesToPoints(curves: CubicBezierCurve[]): Vector2[] {
  const cached = curvesToPointsCache.get(curves);
  if (cached !== undefined) {
    return cached;
  }

  const resolution = 1;
  const spacing = PATH_SPACING_PHYSICS;
  const points: Vector2[] = [];
  let consumedLength = 0;
  let prevPoint = curves[0].start;
  points.push(prevPoint);
  for (const cubicBezierCurve of curves) {
    const samples = Math.ceil(
      getCurveLength(cubicBezierCurve) * resolution * 10.0
    );
    for (let index = 0; index <= samples; ++index) {
      const t = (index * 1) / samples;
      const point = getCurvePoint(cubicBezierCurve, t);
      consumedLength += vec2Distance(prevPoint, point);
      while (consumedLength >= spacing) {
        const num3 = consumedLength - spacing;
        const vector2 = vec2Add(
          point,
          vec2Scale(vec2Normalize(vec2Subtract(prevPoint, point)), num3)
        );
        points.push(vector2);
        consumedLength = num3;
        prevPoint = vector2;
      }
      prevPoint = point;
    }
  }
  if (consumedLength > 0.0) {
    points.push(getCurvePoint(curves[curves.length - 1], 1));
  }

  curvesToPointsCache.set(curves, points);

  return points;
}

const curvePointsCache = new Map<CubicBezierCurve, Vector2[]>();
export function curveToPoints(
  curve: CubicBezierCurve
  // spacing: number = PATH_SPACING_PHYSICS,
  // resolution: number = 1
): Vector2[] {
  const spacing: number = PATH_SPACING_PHYSICS;
  const resolution: number = 1;

  // if (spacing <= Number.EPSILON) {
  //   throw new Error("curveToPoints: spacing must be greater than 0");
  // }
  // if (resolution <= 0) {
  //   throw new Error("curveToPoints: resolution must be greater than 0");
  // }

  const cached = curvePointsCache.get(curve);
  if (cached !== undefined) {
    return cached;
  }

  const points: Vector2[] = [];

  let remainingDistance = 0;
  let previousPoint: Vector2 = curve.start;

  points.push(previousPoint);

  const samplePointCount = Math.ceil(getCurveLength(curve) * resolution * 10.0);
  for (let index = 0; index <= samplePointCount; index++) {
    const t = index / samplePointCount;
    const point = getCurvePoint(curve, t);
    remainingDistance += vec2Distance(previousPoint, point);
    while (remainingDistance >= spacing) {
      remainingDistance = remainingDistance - spacing;
      const splitPoint = vec2Add(
        point,
        vec2Scale(
          vec2Normalize(vec2Subtract(previousPoint, point)),
          remainingDistance
        )
      );
      points.push(splitPoint);
      previousPoint = splitPoint;
    }
    previousPoint = point;
  }

  if (remainingDistance > 0) {
    points.push(getCurvePoint(curve, 1));
  }

  Object.freeze(points);
  for (const p of points) {
    Object.freeze(p);
  }
  curvePointsCache.set(curve, points);

  return points;
}
