import { clamp } from "lodash";

export function getEffectTier(
  distance: number,
  angleDegreesDelta: number
): number {
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
