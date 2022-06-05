import {
  BEZIER_CURVE_LENGTH_RESOLUTION,
  PATH_SPACING_PHYSICS,
} from "./game-settings";

import {
  Point,
  pointAdd,
  pointDistance,
  pointMagnitude,
  pointNormalize,
  pointScale,
  pointSubtract,
  PointZero,
} from "./points";

export interface CubicBezierCurve {
  start: Point;
  p1: Point;
  p2: Point;
  end: Point;
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

export function getCurvePoint(curve: CubicBezierCurve, t: number): Point {
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

export function getCurveLength(
  curve: CubicBezierCurve,
  resolution: number = BEZIER_CURVE_LENGTH_RESOLUTION
): number {
  let length = 0.0;
  let previousPoint = getCurvePoint(curve, 0);

  for (let index = 1; index <= resolution; index++) {
    const point = getCurvePoint(curve, index / resolution);
    const vector2_2 = pointSubtract(point, previousPoint);
    length += pointMagnitude(vector2_2);
    previousPoint = point;
  }

  return length;
}

export function curveToPoints(
  curve: CubicBezierCurve,
  spacing: number = PATH_SPACING_PHYSICS,
  resolution: number = 1
): Point[] {
  if (spacing <= Number.EPSILON) {
    throw new Error("curveToPoints: spacing must be greater than 0");
  }
  if (resolution <= 0) {
    throw new Error("curveToPoints: resolution must be greater than 0");
  }

  const points: Point[] = [];

  let remainingDistance = 0;
  let previousPoint: Point = curve.start;

  points.push(previousPoint);

  const samplePointCount = Math.ceil(getCurveLength(curve) * resolution * 10.0);
  for (let index = 0; index <= samplePointCount; index++) {
    const t = index / samplePointCount;
    const point = getCurvePoint(curve, t);
    remainingDistance += pointDistance(previousPoint, point);
    while (remainingDistance >= spacing) {
      remainingDistance = remainingDistance - spacing;
      const splitPoint = pointAdd(
        point,
        pointScale(
          pointNormalize(pointSubtract(previousPoint, point)),
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

  return points;
}
