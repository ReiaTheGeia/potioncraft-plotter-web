import { sum } from "lodash";
import { PATH_SPACING_PHYSICS } from "./game-settings";

import {
  linearInterpolate,
  Point,
  pointAdd,
  pointDistance,
  pointMagnitude,
  pointScale,
  pointSubtract,
  PointZero,
} from "./points";

export type PointArray = Point[];
export type ReadOnlyPointArray = readonly Point[];

export function pointArrayLength(pointArray: ReadOnlyPointArray): number {
  if (pointArray.length <= 1) {
    return 0;
  }

  let length = 0;
  let previousPoint = pointArray[0];
  for (let i = 1; i < pointArray.length; i++) {
    length += pointDistance(previousPoint, pointArray[i]);
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
  start: Point,
  direction: Point,
  distance: number,
  spacing: number = PATH_SPACING_PHYSICS
) {
  const pointArray: PointArray = [];
  if (pointMagnitude(direction) === 0) {
    throw new Error("direction must be valid.");
  }

  if (distance <= 0) {
    return [];
  }

  let previousPoint = start;
  let remainingDistance = distance;
  while (remainingDistance >= spacing) {
    const point = pointAdd(previousPoint, pointScale(direction, spacing));
    pointArray.push(point);
    remainingDistance -= spacing;
    previousPoint = point;
  }

  if (remainingDistance > 0) {
    pointArray.push(
      pointAdd(previousPoint, pointScale(direction, remainingDistance))
    );
  }

  return pointArray;
}

export function pointArrayOffset(
  pointArray: PointArray,
  offset: Point
): PointArray {
  return pointArray.map((point) => pointAdd(point, offset));
}

export function takePointArrayByDistance<T extends Point>(
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
    const length = pointDistance(p, previousPoint);
    if (takenLength + length >= takeLength) {
      const remainingLength = takeLength - takenLength;
      const splitPoint = linearInterpolate(
        previousPoint,
        p,
        remainingLength / length
      );
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
