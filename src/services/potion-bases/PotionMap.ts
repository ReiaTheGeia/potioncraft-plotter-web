import { Point } from "@/points";

import { MapEntity } from "./types";

export class PotionMap {
  constructor(private _entities: readonly Readonly<MapEntity>[]) {}

  get entities(): readonly Readonly<MapEntity>[] {
    return this._entities;
  }

  hitTest(p: Point): readonly Readonly<MapEntity>[] {
    throw new Error("Method not implemented.");
  }
}
