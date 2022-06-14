import { POTION_RADIUS } from "@/game-settings";
import { Vector2, vec2Magnitude, vec2Rotate, vec2Subtract } from "@/points";
import {
  rectangle,
  Rectangle,
  rectFromCircle,
  rectOffset,
  rectSize,
} from "@/rectangles";
import { degreesToRadians } from "@/utils";

import { MapEntity } from "./types";

export interface EntityDefinition {
  readonly entityType: MapEntity["entityType"];
  getFriendlyName(entity: MapEntity): string;
  getBounds(entity: MapEntity): Rectangle;
  hitTest(p: Vector2, entity: MapEntity, radius?: number): boolean;
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
    hitTest(p: Vector2, entity: MapEntity, radius = 0) {
      return vec2Magnitude(vec2Subtract(p, entity)) - radius <= POTION_RADIUS;
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
    hitTest(p: Vector2, entity: MapEntity, radius = 0) {
      const bone = assertEntity(entity, "DangerZonePart");
      if (bone.prefab === "Skull1") {
        return vec2Magnitude(vec2Subtract(p, entity)) - radius <= 0.24;
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

      const boneAngle = degreesToRadians(bone.angle);

      // get it aligned with the axis aligned hitbox of the bone
      p = vec2Subtract(p, entity);
      p = vec2Rotate(p, -boneAngle);

      const rc = {
        x: r.p1.x + (r.p2.x - r.p1.x) / 2,
        y: r.p1.y + (r.p2.y - r.p1.y) / 2,
      };
      const rsize = rectSize(r);

      const distx = Math.abs(p.x - rc.x);
      const disty = Math.abs(p.y - rc.y);

      const dx = distx - rsize.width / 2;
      const dy = disty - rsize.height / 2;
      if (
        distx > rsize.width / 2 + radius ||
        disty > rsize.height / 2 + radius
      ) {
        return false;
      }

      if (
        dx * dx + dy * dy > radius * radius &&
        distx > rsize.width / 2 &&
        disty > rsize.height / 2
      ) {
        return false;
      }

      return true;
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
    hitTest: (p: Vector2, entity: MapEntity, radius = 0): boolean => {
      return vec2Magnitude(vec2Subtract(p, entity)) - radius <= 0.3;
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
    hitTest: (p: Vector2, entity: MapEntity, radius = 0): boolean => {
      const vortex = assertEntity(entity, "Vortex");
      const vortexRadius = VortexRadii[vortex.prefab];
      return vec2Magnitude(vec2Subtract(p, entity)) - radius <= vortexRadius;
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
