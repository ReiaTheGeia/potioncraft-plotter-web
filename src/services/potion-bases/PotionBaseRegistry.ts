import { injectable, singleton } from "microinject";

import { typedKeys } from "@/utils";

import { PotionBaseMaps } from "./maps";
import { PotionMap } from "./PotionMap";
import { PotionBaseId, PotionBase } from "./types";

@injectable()
@singleton()
export class PotionBaseRegistry {
  private readonly _potionBasesById: Record<PotionBaseId, PotionBase> = {};

  constructor() {
    for (const key of typedKeys(PotionBaseMaps)) {
      const id = key as PotionBaseId;
      const base: PotionBase = {
        id,
        map: new PotionMap(PotionBaseMaps[key]),
      };
      this._potionBasesById[id] = base;
    }
  }

  getPotionBaseById(id: PotionBaseId): PotionBase | null {
    return this._potionBasesById[id] ?? null;
  }
}
