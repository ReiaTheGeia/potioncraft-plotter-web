import { Vector2 } from "@/points";
import { Rectangle } from "@/rectangles";

export type MapEntity =
  | PotionEffectMapEntity
  | DangerZonePartMapEntity
  | ExperienceBonusMapEntity
  | VortexMapEntity;

export interface PotionEffectMapEntity {
  entityType: "PotionEffect";
  x: number;
  y: number;
  effect: string;
}

export interface DangerZonePartMapEntity {
  entityType: "DangerZonePart";
  x: number;
  y: number;
  angle: number;
  prefab: string;
}

export interface ExperienceBonusMapEntity {
  entityType: "ExperienceBonus";
  x: number;
  y: number;
  prefab: "Large" | "Medium" | "Little";
}

export interface VortexMapEntity {
  entityType: "Vortex";
  x: number;
  y: number;
  prefab: "Large" | "Medium";
}
