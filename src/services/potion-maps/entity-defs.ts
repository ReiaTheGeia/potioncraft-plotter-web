import { POTION_RADIUS } from "@/game-settings";
import { Point, pointMagnitude, pointSubtract } from "@/points";
import { Rectangle, rectFromCircle } from "@/rectangles";

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
      // FIXME: hack.  Use the actual hitboxes
      return rectFromCircle(entity, 0.24);
    },
    hitTest(p: Point, entity: MapEntity, radius = 0) {
      // FIXME: hack.  Use the actual hitboxes
      return pointMagnitude(pointSubtract(p, entity)) - radius <= 0.24;
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
