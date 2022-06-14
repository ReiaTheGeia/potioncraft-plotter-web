import { Identifier, ServiceLocator } from "microinject";
import { last } from "lodash";

import { vec2Distance, Vec2Zero, Vector2 } from "@/vector2";
import { pointArrayLength } from "@/point-array";

import { PlotItem } from "@/services/plotter/types";

import { Plotter } from "../../plotter/Plotter";
import { getEffectTier } from "../../plotter/utils";

import { PotionMap } from "../../potion-maps/PotionMap";

import { IChallenge } from "../Challenge";

export interface BrewEffectAtPointChallengeOptions {
  baseMap: PotionMap;
  targetPosition: Vector2;
}

export const BrewEffectAtPointChallengeFactory: Identifier<BrewEffectAtPointChallengeFactory> =
  "BrewEffectAtPointChallengeFactory";
export type BrewEffectAtPointChallengeFactory = (
  options: BrewEffectAtPointChallengeOptions
) => IChallenge;

export function brewEffectAtPointChallengeFactoryFactory(
  serviceLocator: ServiceLocator
) {
  return (options: BrewEffectAtPointChallengeOptions) => {
    const plotter = serviceLocator.get(Plotter);
    new BrewEffectAtPointChallenge(
      options.baseMap,
      options.targetPosition,
      plotter
    );
  };
}
class BrewEffectAtPointChallenge implements IChallenge {
  private readonly _map: PotionMap;

  constructor(
    baseMap: PotionMap,
    private readonly _targetPosition: Vector2,
    private readonly _plotter: Plotter
  ) {
    this._map = new PotionMap([
      ...baseMap.entities.filter((x) => x.entityType !== "PotionEffect"),
      {
        entityType: "PotionEffect",
        // TODO: Should probably make a "Challenge" effect internal to us.
        effect: "Lightning",
        ..._targetPosition,
      },
    ]);
  }

  get map(): PotionMap {
    return this._map;
  }

  getScore(plotItems: readonly PlotItem[]): number | null {
    const { committedPoints } = this._plotter.plotItems(plotItems, this._map);
    const lastPoint = last(committedPoints) ?? Vec2Zero;
    const isComplete =
      getEffectTier(vec2Distance(lastPoint, this._targetPosition), 0) >= 3;
    if (!isComplete) {
      return null;
    }

    // Return a score based on how much distance they took to get there compared to the 'perfect' distance of a straight line.
    const pathDistance = pointArrayLength(committedPoints);
    const linearDistance = vec2Distance(Vec2Zero, this._targetPosition);
    return 1 - pathDistance / linearDistance;
  }
}
