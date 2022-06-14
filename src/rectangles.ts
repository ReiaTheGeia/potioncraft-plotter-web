import {
  Vector2,
  vec2Add,
  Vec2Zero,
  vec2Magnitude,
  vec2Subtract,
} from "./points";
import { Size } from "./size";

export interface Rectangle {
  p1: Vector2;
  p2: Vector2;
}

export const RectZero: Readonly<Rectangle> = Object.freeze({
  p1: Vec2Zero,
  p2: Vec2Zero,
}) as any;

export function rectangle(x: number, y: number, w: number, h: number) {
  return {
    p1: { x, y },
    p2: { x: x + w, y: y + h },
  };
}

export function rectFromCircle(p: Vector2, radius: number) {
  return {
    p1: {
      x: p.x - radius,
      y: p.y - radius,
    },
    p2: {
      x: p.x + radius,
      y: p.y + radius,
    },
  };
}

export function rectOffset(r: Rectangle, offset: Vector2) {
  return {
    p1: vec2Add(r.p1, offset),
    p2: vec2Add(r.p2, offset),
  };
}

export function normalizeRectangle(p1: Vector2, p2: Vector2): Rectangle;
export function normalizeRectangle(r: Rectangle): Rectangle;
export function normalizeRectangle(...args: any[]): Rectangle {
  let p1: Vector2;
  let p2: Vector2;
  if (args.length === 1) {
    const r = args[0] as Rectangle;
    p1 = r.p1;
    p2 = r.p2;
  } else {
    p1 = args[0] as Vector2;
    p2 = args[1] as Vector2;
  }
  return {
    p1: {
      x: Math.min(p1.x, p2.x),
      y: Math.min(p1.y, p2.y),
    },
    p2: {
      x: Math.max(p1.x, p2.x),
      y: Math.max(p1.y, p2.y),
    },
  };
}

export function addPointToRect(r: Rectangle, p: Vector2): Rectangle {
  return {
    p1: {
      x: Math.min(r.p1.x, p.x),
      y: Math.min(r.p1.y, p.y),
    },
    p2: {
      x: Math.max(r.p2.x, p.x),
      y: Math.max(r.p2.y, p.y),
    },
  };
}

export function pointIntersectsRect(p: Vector2, r: Rectangle): boolean {
  r = normalizeRectangle(r);

  if (r.p1.x > p.x || r.p2.x < p.x) {
    return false;
  }

  if (r.p1.y > p.y || r.p2.y < p.y) {
    return false;
  }

  return true;
}

export function rectSize(r: Rectangle): Size {
  r = normalizeRectangle(r);
  return {
    width: r.p2.x - r.p1.x,
    height: r.p2.y - r.p1.y,
  };
}
