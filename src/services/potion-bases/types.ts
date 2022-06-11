import { Opaque } from "type-fest";

import { PotionMap } from "../potion-maps/PotionMap";

export type PotionBaseId = Opaque<string, "PotionBaseId">;

export interface PotionBase {
  readonly id: PotionBaseId;
  readonly map: PotionMap;
}
