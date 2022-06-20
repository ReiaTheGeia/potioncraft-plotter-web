import { POTION_RADIUS } from "@/game-settings";
import { vec2Magnitude, vec2Subtract } from "@/vector2";
import { clamp } from "lodash";
import { IngredientRegistry } from "../ingredients/IngredientRegistry";
import { isIngredientPlotItem, PlotPoint } from "./types";

export function getEffectTier(
  distance: number,
  angleDegreesDelta: number
): number {
  // Bottle and effect both have radius of POTION_RADIUS, and they must touch
  // to achieve the first tier.
  if (distance >= POTION_RADIUS * 2) {
    return 0;
  }

  // From RecipeMapManager.GetEffectTier()
  const middleEffectPowerPosition = 0.9;
  const effectPowerDistanceDependence = (value: number) => {
    return -0.36 * value + 0.72;
  };
  const effectPowerAngleDependence = (value: number) => {
    // TODO: angle
    // We know its 0.3 at the perfect angle.
    return 0.3;
  };

  const value = clamp(
    effectPowerDistanceDependence(distance) +
      effectPowerAngleDependence(angleDegreesDelta),
    0,
    1
  );
  if (value < middleEffectPowerPosition) {
    return 1;
  }
  return !(Math.abs(value - 1) < Number.EPSILON) ? 2 : 3;
}

export function calculateDangerLengths(
  items: PlotPoint[],
  ingredientRegistry: IngredientRegistry
): number[] {
  const lengths: number[] = [];
  let currentLength = 0;
  let prevItem = items[0];
  for (let i = 1; i < items.length; i++) {
    const item = items[i];
    let teleports = false;
    if (isIngredientPlotItem(item.source)) {
      const ingredient = ingredientRegistry.getIngredientById(
        item.source.ingredientId
      );
      if (ingredient && ingredient.teleports) {
        teleports = true;
      }
    }
    if (
      !teleports &&
      item.bottleCollisions.some((x) => x.entityType === "DangerZonePart")
    ) {
      currentLength += vec2Magnitude(vec2Subtract(item, prevItem));
    } else {
      lengths.push(currentLength);
      currentLength = 0;
    }
    prevItem = item;
  }

  if (currentLength > 0) {
    lengths.push(currentLength);
  }

  return lengths;
}
