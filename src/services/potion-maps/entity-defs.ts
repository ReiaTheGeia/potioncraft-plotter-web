import { POTION_RADIUS } from "@/game-settings";
import { Point, pointMagnitude, pointSubtract } from "@/points";
import { Rectangle, rectFromCircle } from "@/rectangles";

import { MapEntity } from "./types";

export interface EntityDefinition {
  readonly entityType: MapEntity["entityType"];
  getBounds(entity: MapEntity): Rectangle;
  hitTest(p: Point, entity: MapEntity, radius?: number): boolean;
}

class RadiusEntity implements EntityDefinition {
  constructor(
    private readonly _entityType: MapEntity["entityType"],
    private readonly _radius: number
  ) {}

  get entityType() {
    return this._entityType;
  }

  getBounds(entity: MapEntity): Rectangle {
    return rectFromCircle(entity, this._radius);
  }

  hitTest(p: Point, entity: MapEntity, radius = 0): boolean {
    return pointMagnitude(pointSubtract(p, entity)) - radius <= this._radius;
  }
}

const VortexRadii = {
  Large: 1.65,
  Medium: 1.25,
} as const;

export const EntityDefs: Record<MapEntity["entityType"], EntityDefinition> = {
  PotionEffect: new RadiusEntity("PotionEffect" as const, POTION_RADIUS),
  // NOTE: This should be replaced by something that knows the different hitboxes of each type.
  // This would be complicated, as many of them are rects and rotation needs to be taken into account.
  DangerZonePart: new RadiusEntity("DangerZonePart" as const, 0.24),
  ExperienceBonus: {
    entityType: "ExperienceBonus",
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
