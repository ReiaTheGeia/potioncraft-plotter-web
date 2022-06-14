import { first } from "lodash";

import { MAP_EXTENT_RADIUS } from "@/game-settings";
import { Vector2, vec2Add } from "@/vector2";
import { Rectangle } from "@/rectangles";

const MAP_WIDTH = MAP_EXTENT_RADIUS * 2;
const MAP_HEIGHT = MAP_EXTENT_RADIUS * 2;
const REGION_WIDTH = 0.5;
const REGION_HEIGHT = 0.5;

const ORIGIN_OFFSET: Vector2 = { x: MAP_EXTENT_RADIUS, y: MAP_EXTENT_RADIUS };

export const REGION_COUNT =
  (MAP_WIDTH / REGION_WIDTH) * (MAP_HEIGHT / REGION_HEIGHT) + 1;
export const FALLBACK_REGION = REGION_COUNT - 1;

export function getRegionIndexFromPoint(p: Vector2): number {
  return first(getRegionIndexesFromRect({ p1: p, p2: p }))!;
}

export function getRegionIndexesFromRect(r: Rectangle): number[] {
  let { p1, p2 } = r;
  p1 = vec2Add(p1, ORIGIN_OFFSET);
  p2 = vec2Add(p2, ORIGIN_OFFSET);

  let x1 = Math.floor(p1.x / REGION_WIDTH);
  let y1 = Math.floor(p1.y / REGION_HEIGHT);
  let x2 = Math.ceil(p2.x / REGION_WIDTH);
  let y2 = Math.ceil(p2.y / REGION_HEIGHT);

  const indexes = [];

  let addedOOB = false;
  const addOOB = () => {
    if (addedOOB) {
      return;
    }
    indexes.push(FALLBACK_REGION);
    addedOOB = true;
  };

  if (x1 < 0) {
    x1 = 0;
    addOOB();
  }

  if (x2 < 0) {
    x2 = 0;
    addOOB();
  }

  if (x1 >= MAP_WIDTH / REGION_WIDTH) {
    x1 = MAP_WIDTH / REGION_WIDTH - 1;
    addOOB();
  }

  if (x2 >= MAP_WIDTH / REGION_WIDTH) {
    x2 = MAP_WIDTH / REGION_WIDTH - 1;
    addOOB();
  }

  if (y1 < 0) {
    y1 = 0;
    addOOB();
  }

  if (y2 < 0) {
    y2 = 0;
    addOOB();
  }

  if (y1 >= MAP_HEIGHT / REGION_HEIGHT) {
    y1 = MAP_HEIGHT / REGION_HEIGHT - 1;
    addOOB();
  }

  if (y2 >= MAP_HEIGHT / REGION_HEIGHT) {
    y2 = MAP_HEIGHT / REGION_HEIGHT - 1;
    addOOB();
  }

  for (let x = x1; x <= x2; x++) {
    for (let y = y1; y <= y2; y++) {
      indexes.push(x + y * (MAP_WIDTH / REGION_WIDTH));
    }
  }

  return indexes;
}
