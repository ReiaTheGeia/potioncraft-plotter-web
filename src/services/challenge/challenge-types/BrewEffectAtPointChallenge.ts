import { Identifier, ServiceLocator } from "microinject";
import { clamp, last, sum, uniq } from "lodash";

import { vec2Distance, Vec2Zero, Vector2 } from "@/vector2";
import { pointArrayLength } from "@/point-array";

import { AddIngredientPlotItem, PlotItem } from "@/services/plotter/types";

import { Plotter } from "../../plotter/Plotter";
import { getEffectTier, calculateDangerLengths } from "../../plotter/utils";

import { PotionMap } from "../../potion-maps/PotionMap";

import { ChallengeResults, IChallenge } from "../Challenge";
import { DANGER_LENGTH_LETHAL } from "@/game-settings";
import { IngredientRegistry } from "@/services/ingredients/IngredientRegistry";

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
    const ingredientRegistry = serviceLocator.get(IngredientRegistry);
    return new BrewEffectAtPointChallenge(
      options.baseMap,
      options.targetPosition,
      plotter,
      ingredientRegistry
    );
  };
}
class BrewEffectAtPointChallenge implements IChallenge {
  private readonly _map: PotionMap;

  constructor(
    baseMap: PotionMap,
    private readonly _targetPosition: Vector2,
    private readonly _plotter: Plotter,
    private readonly _ingredientRegistry: IngredientRegistry
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

  get description(): string {
    return `Brew the effect at (${this._targetPosition.x}, ${this._targetPosition.y})`;
  }

  getScore(plotItems: readonly PlotItem[]): ChallengeResults | null {
    // Disallow cheats/utilities.
    if (plotItems.some((x) => x.type === "set-position")) {
      return null;
    }

    const results: ChallengeResults = {};

    // Reward multiplied by the teir of the effect.
    const TIER_REWARD = 1000;

    const WATERLESS_REWARD = 500;
    const VORTEXLESS_REWARD = 200;

    // Penalty for distance scaled by the actual distance divided by linear distance.  Twice as long will subtract 100 points.
    const DISTANCE_PENALTY = -100;

    // Penalty for stress.  Penalty applies to any stress value over 1.
    const STRESS_PENALTY = -100;

    // Each unit of cost subtracts this from the score.
    const COST_PENALTY = -5;

    const { committedPoints } = this._plotter.plotItems(plotItems, this._map);
    const lastPoint = last(committedPoints) ?? Vec2Zero;
    const tier = getEffectTier(
      vec2Distance(lastPoint, this._targetPosition),
      0
    );

    const isComplete = tier > 0;
    if (!isComplete) {
      return null;
    }

    let totalScore = 0;

    const tierScore = TIER_REWARD * tier;
    totalScore += tierScore;
    results["tier"] = {
      value: `Tier ${tier}`,
      score: tierScore,
    };

    if (plotItems.every((x) => x.type !== "pour-solvent")) {
      totalScore += WATERLESS_REWARD;
      results["waterless"] = {
        value: "Waterless",
        score: WATERLESS_REWARD,
      };
    }

    if (plotItems.every((x) => x.type !== "heat-vortex")) {
      totalScore += VORTEXLESS_REWARD;
      results["vortexless"] = {
        value: "Vortexless",
        score: VORTEXLESS_REWARD,
      };
    }

    // Grade based on the distance they took to get there compared to the 'perfect' distance of a straight line.
    const pathDistance = pointArrayLength(committedPoints);
    const linearDistance = vec2Distance(Vec2Zero, this._targetPosition);
    const distanceFraction = pathDistance / linearDistance;
    const distanceScore = Math.round(DISTANCE_PENALTY * distanceFraction);
    totalScore += distanceScore;
    results["distance"] = {
      value: `${pathDistance.toFixed(2)} / ${linearDistance.toFixed(2)}`,
      score: distanceScore,
    };

    const ingredients = plotItems
      .filter(isAddIngredientPlotItem)
      .map((x) => x.ingredientId);

    let baseCost = 0;
    let ingredientTypeCounts: Record<string, number> = {};
    for (const ingredientId of ingredients) {
      const ingredient =
        this._ingredientRegistry.getIngredientById(ingredientId);
      if (!ingredient) {
        continue;
      }
      baseCost += ingredient.price;
      ingredientTypeCounts[ingredient.id] =
        (ingredientTypeCounts[ingredient.id] ?? 0) + 1;
    }

    const stress = Math.sqrt(
      sum(
        Object.keys(ingredientTypeCounts).map((key) =>
          Math.pow(ingredientTypeCounts[key], 2)
        )
      )
    );

    const potentialHighlanderStress = Math.sqrt(
      Object.keys(ingredientTypeCounts).length
    );
    const stressScore = Math.round(
      STRESS_PENALTY * Math.max(stress - potentialHighlanderStress, 0)
    );
    if (stressScore < 0) {
      totalScore += stressScore;
      results["stress"] = {
        value: `${stress.toFixed(2)} / ${potentialHighlanderStress.toFixed(2)}`,
        score: stressScore,
      };
    }

    const costScore = Math.round(COST_PENALTY * baseCost);
    totalScore += costScore;
    results["cost"] = {
      value: `${baseCost.toFixed(2)}`,
      score: costScore,
    };

    const dangerLength = Math.max(...calculateDangerLengths(committedPoints));
    if (dangerLength > DANGER_LENGTH_LETHAL) {
      // TODO: Charge for life salt for bones.
      // Each unit of life salt costs (8736 / 5000) to produce.  Check how much life it regens and use that to find the cost
      // to escape EACH danger segment.
      results["bones"] = {
        value: "Bone penalty (-25%)",
        score: -Math.round(totalScore * 0.25),
      };
    }

    return results;
  }
}

function isAddIngredientPlotItem(
  item: PlotItem
): item is AddIngredientPlotItem {
  return item.type === "add-ingredient";
}
