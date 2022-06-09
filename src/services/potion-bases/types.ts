import { Opaque } from "type-fest";

import { PotionMap } from "./PotionMap";

export type PotionBaseId = Opaque<string, "PotionBaseId">;

export interface PotionBase {
  readonly id: PotionBaseId;
  readonly map: PotionMap;
}

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
  prefab: string;
}

export interface VortexMapEntity {
  entityType: "Vortex";
  x: number;
  y: number;
  prefab: string;
}
