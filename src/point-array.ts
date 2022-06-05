import { sum } from "lodash";
import { PATH_SPACING_PHYSICS } from "./game-settings";

import {
  linearInterpolate,
  Point,
  pointAdd,
  pointMagnitude,
  pointScale,
  pointSubtract,
  PointZero,
} from "./points";

export type PointArray = Point[];

export function pointArrayLength(pointArray: PointArray): number {
  return sum(pointArray.map((point) => pointMagnitude(point)));
}

export function pointArrayLineFromDistance(
  start: Point,
  direction: Point,
  distance: number,
  spacing: number = PATH_SPACING_PHYSICS
) {
  const pointArray: PointArray = [];

  let remainingDistance = distance;
  while (remainingDistance >= spacing) {
    pointArray.push(pointAdd(start, pointScale(direction, spacing)));
  }

  if (remainingDistance > 0) {
    pointArray.push(
      pointAdd(
        pointArray[pointArray.length - 1] ?? PointZero,
        pointScale(direction, remainingDistance)
      )
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

  const taken: T[] = [];
  const remainder: T[] = [];

  let takenLength = 0;
  let previousPoint = array[0];
  for (let i = 1; i < array.length; i++) {
    const p = array[i];
    const length = pointMagnitude(pointSubtract(p, previousPoint));
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
    }

    takenLength += length;
    taken.push(p);
    previousPoint = p;
  }

  return [taken, remainder];
}
