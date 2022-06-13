import { POTION_RADIUS } from "@/game-settings";
import {
  Point,
  pointAdd,
  pointMagnitude,
  pointRotate,
  pointSubtract,
} from "@/points";
import {
  rectangle,
  Rectangle,
  rectFromCircle,
  rectOffset,
  pointIntersectsRect,
} from "@/rectangles";

import { MapEntity } from "./types";

export interface EntityDefinition {
  readonly entityType: MapEntity["entityType"];
  getFriendlyName(entity: MapEntity): string;
  getBounds(entity: MapEntity): Rectangle;
  hitTest(p: Point, entity: MapEntity, radius?: number): boolean;
}

const VortexRadii = {
  Large: 1.65,
  Medium: 1.25,
} as const;

export const EntityDefs: Record<MapEntity["entityType"], EntityDefinition> = {
  PotionEffect: {
    entityType: "PotionEffect",
    getFriendlyName(entity: MapEntity) {
      const effectEntity = assertEntity(entity, "PotionEffect");
      return effectEntity.effect;
    },
    getBounds(entity: MapEntity) {
      return rectFromCircle(entity, POTION_RADIUS);
    },
    hitTest(p: Point, entity: MapEntity, radius = 0) {
      return pointMagnitude(pointSubtract(p, entity)) - radius <= POTION_RADIUS;
    },
  },
  // NOTE: This should be replaced by something that knows the different hitboxes of each type.
  // This would be complicated, as many of them are rects and rotation needs to be taken into account.
  DangerZonePart: {
    entityType: "DangerZonePart",
    getFriendlyName(entity: MapEntity) {
      const boneEntity = assertEntity(entity, "DangerZonePart");
      // return boneEntity.prefab;
      return "Bone";
    },
    getBounds(entity: MapEntity) {
      const bone = assertEntity(entity, "DangerZonePart");
      // FIXME: hack.  Use the actual hitboxes
      switch (bone.prefab) {
        case "Fang1":
          // Need to cover all rotations, so use the largest axis for both.
          return rectOffset(rectangle(-0.06, -0.06, 0.12, 0.12), entity);
        case "Fang2":
          // Need to cover all rotations, so use the largest axis for both.
          return rectOffset(rectangle(-0.12, -0.12, 0.24, 0.24), entity);
        case "Bone1":
          // Need to cover all rotations, so use the largest axis for both.
          return rectOffset(rectangle(-0.345, -0.345, 0.69, 0.69), entity);
        case "Bone2":
          // Need to cover all rotations, so use the largest axis for both.
          return rectOffset(rectangle(-0.32, -0.32, 0.72, 0.72), entity);
        case "Skull1":
        default:
          return rectFromCircle(entity, 0.24);
      }
    },
    hitTest(p: Point, entity: MapEntity, radius = 0) {
      const bone = assertEntity(entity, "DangerZonePart");
      if (bone.prefab === "Skull1") {
        return false; //pointMagnitude(pointSubtract(p, entity)) - radius <= 0.24;
      }

      let r: Rectangle;
      switch (bone.prefab) {
        case "Fang1":
          r = rectangle(-0.06, -0.02, 0.12, 0.4);
          break;
        case "Fang2":
          r = rectangle(-0.065, -0.12, 0.13, 0.24);
          break;
        case "Bone1":
          r = rectangle(-0.06, -0.345, 0.12, 0.69);
          break;
        case "Bone2":
          r = rectangle(-0.07, -0.36, 0.14, 0.72);
          break;
        default:
          return false;
      }

      // get it aligned with the axis aligned hitbox of the bone
      p = pointSubtract(p, entity);
      p = pointRotate(p, -bone.angle);

      // https://stackoverflow.com/questions/21089959/detecting-collision-of-rectangle-with-circle
      const w = r.p2.x - r.p1.x;
      const h = r.p2.y - r.p1.y;
      const distX = Math.abs(p.x - r.p1.x - w / 2);
      const distY = Math.abs(p.y - r.p1.y - w / 2);

      if (distX > w / 2 + radius) {
        return false;
      }
      if (distY > h / 2 + radius) {
        return false;
      }

      if (distX <= w / 2) {
        return true;
      }
      if (distY <= h / 2) {
        return true;
      }

      var dx = distX - w / 2;
      var dy = distY - h / 2;
      return dx * dx + dy * dy <= radius * radius;
    },
  },
  ExperienceBonus: {
    entityType: "ExperienceBonus",
    getFriendlyName(entity: MapEntity) {
      const expEntity = assertEntity(entity, "ExperienceBonus");
      return `${expEntity.prefab} XP Bonus`;
    },
    getBounds: (entity: MapEntity): Rectangle => {
      // FIXME: Arent these different sizes?
      return rectFromCircle(entity, 0.3);
    },
    hitTest: (p: Point, entity: MapEntity, radius = 0): boolean => {
      return pointMagnitude(pointSubtract(p, entity)) - radius <= 0.3;
    },
  },
  Vortex: {
    entityType: "Vortex",
    getFriendlyName(entity: MapEntity) {
      return "Vortex";
    },
    getBounds: (entity: MapEntity): Rectangle => {
      const vortex = assertEntity(entity, "Vortex");
      const radius = VortexRadii[vortex.prefab];
      return rectFromCircle(entity, radius);
    },
    hitTest: (p: Point, entity: MapEntity, radius = 0): boolean => {
      const vortex = assertEntity(entity, "Vortex");
      const vortexRadius = VortexRadii[vortex.prefab];
      return pointMagnitude(pointSubtract(p, entity)) - radius <= vortexRadius;
    },
  },
};

function assertEntity<T extends MapEntity["entityType"]>(
  entity: MapEntity,
  type: T
): MapEntity & { entityType: T } {
  if (entity.entityType === type) {
    return entity as any;
  }
  throw new Error(`Expected entity to be of type ${type}`);
}
