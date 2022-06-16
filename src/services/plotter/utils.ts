import { POTION_RADIUS } from "@/game-settings";
import { vec2Magnitude, vec2Subtract } from "@/vector2";
import { clamp } from "lodash";
import { PlotPoint } from "./types";

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

export function longestDangerLength(items: PlotPoint[]): number {
  let longestLength = 0;
  let currentLength = 0;
  let prevItem = items[0];
  for (let i = 1; i < items.length; i++) {
    const item = items[i];
    if (item.entities.some((x) => x.entityType === "DangerZonePart")) {
      currentLength += vec2Magnitude(vec2Subtract(item, prevItem));
    } else {
      longestLength = Math.max(longestLength, currentLength);
      currentLength = 0;
    }
    prevItem = item;
  }

  return Math.max(longestLength, currentLength);
}