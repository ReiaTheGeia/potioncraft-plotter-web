import { uniq } from "lodash";

import { Point } from "@/points";
import { rectFromCircle } from "@/rectangles";

import {
  getRegionIndexesFromRect,
  getRegionIndexFromPoint,
  REGION_COUNT,
} from "./regions";
import { MapEntity } from "./types";
import { EntityDefs } from "./entity-defs";

export class PotionMap {
  private _entityRegions: MapEntity[][] | null = null;

  constructor(private _entities: readonly Readonly<MapEntity>[]) {}

  get entities(): readonly Readonly<MapEntity>[] {
    return this._entities;
  }

  hitTest(p: Point, radius = 0): readonly Readonly<MapEntity>[] {
    const regions = this._getEntityRegions();

    const indexes =
      radius <= 0
        ? [getRegionIndexFromPoint(p)]
        : getRegionIndexesFromRect(rectFromCircle(p, radius));

    const entities = uniq(
      ([] as MapEntity[]).concat(...indexes.map((index) => regions[index]))
    );

    const result: MapEntity[] = [];
    for (const entity of entities) {
      const entityDef = EntityDefs[entity.entityType];
      if (!entityDef) {
        continue;
      }

      if (entityDef.hitTest(p, entity, radius)) {
        result.push(entity);
      }
    }

    return result;
  }

  private _getEntityRegions(): MapEntity[][] {
    if (this._entityRegions) {
      return this._entityRegions;
    }

    this._entityRegions = new Array(REGION_COUNT);
    for (let i = 0; i < REGION_COUNT; i++) {
      this._entityRegions[i] = [];
    }

    for (const entity of this._entities) {
      const entityDef = EntityDefs[entity.entityType];
      if (!entityDef) {
        continue;
      }
      const bounds = entityDef.getBounds(entity);
      const indexes = getRegionIndexesFromRect(bounds);
      for (const index of indexes) {
        this._entityRegions[index].push(entity);
      }
    }

    return this._entityRegions;
  }
}
