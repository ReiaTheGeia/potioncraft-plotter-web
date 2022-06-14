import { sum } from "lodash";
import { PATH_SPACING_PHYSICS } from "./game-settings";

import {
  vec2Lerp,
  Vector2,
  vec2Add,
  vec2Distance,
  vec2Magnitude,
  vec2Scale,
  vec2Subtract,
  Vec2Zero,
} from "./points";

export type PointArray = Vector2[];
export type ReadOnlyPointArray = readonly Vector2[];

export function pointArrayLength(pointArray: ReadOnlyPointArray): number {
  if (pointArray.length <= 1) {
    return 0;
  }

  let length = 0;
  let previousPoint = pointArray[0];
  for (let i = 1; i < pointArray.length; i++) {
    length += vec2Distance(previousPoint, pointArray[i]);
    previousPoint = pointArray[i];
  }

  return length;
}

const pointArrayLengthCache = new Map<ReadOnlyPointArray, number>();
export function pointArrayLengthCached(pointArray: ReadOnlyPointArray): number {
  if (pointArray.length <= 1) {
    return 0;
  }

  let length = pointArrayLengthCache.get(pointArray);
  if (length !== undefined) {
    return length;
  }

  length = pointArrayLength(pointArray);
  pointArrayLengthCache.set(pointArray, length);

  return length;
}

export function pointArrayLineFromDistance(
  start: Vector2,
  direction: Vector2,
  distance: number,
  spacing: number = PATH_SPACING_PHYSICS
) {
  const pointArray: PointArray = [];
  if (vec2Magnitude(direction) === 0) {
    throw new Error("direction must be valid.");
  }

  if (distance <= 0) {
    return [];
  }

  let previousPoint = start;
  pointArray.push(previousPoint);
  let remainingDistance = distance;
  while (remainingDistance >= spacing) {
    const point = vec2Add(previousPoint, vec2Scale(direction, spacing));
    pointArray.push(point);
    remainingDistance -= spacing;
    previousPoint = point;
  }

  if (remainingDistance > 0) {
    pointArray.push(
      vec2Add(previousPoint, vec2Scale(direction, remainingDistance))
    );
  }

  return pointArray;
}

export function pointArrayOffset(
  pointArray: PointArray,
  offset: Vector2
): PointArray {
  return pointArray.map((point) => vec2Add(point, offset));
}

export function takePointArrayByDistance<T extends Vector2>(
  array: T[],
  takeLength: number
): [taken: T[], remainder: T[]] {
  const totalLength = pointArrayLength(array);

  if (array.length <= 1 || totalLength <= takeLength) {
    return [array, [] as T[]];
  }

  const taken: T[] = [array[0]];
  const remainder: T[] = [];

  let takenLength = 0;
  let previousPoint = array[0];
  for (let i = 1; i < array.length; i++) {
    const p = array[i];
    const length = vec2Distance(p, previousPoint);
    if (takenLength + length >= takeLength) {
      const remainingLength = takeLength - takenLength;
      const splitPoint = vec2Lerp(previousPoint, p, remainingLength / length);
      taken.push(
        Object.assign({}, previousPoint, { x: splitPoint.x, y: splitPoint.y })
      );
      remainder.push(
        Object.assign({}, p, { x: splitPoint.x, y: splitPoint.y }),
        ...array.slice(i)
      );
      break;
    } else {
      takenLength += length;
      taken.push(p);
      previousPoint = p;
    }
  }

  return [taken, remainder];
}
