import React from "react";
import { uniq, sum, clamp, last } from "lodash";

import { Card, CardContent, Typography } from "@mui/material";

import { useDIDependency } from "@/container";
import { pointArrayLength } from "@/point-array";
import { pointMagnitude, pointSubtract, PointZero } from "@/points";

import {
  AddIngredientPlotItem,
  PlotItem,
  PlotPoint,
  PlotResult,
} from "@/services/plotter/types";
import { IngredientRegistry } from "@/services/ingredients/IngredientRegistry";
import { MapEntity, PotionEffectMapEntity } from "@/services/potion-maps/types";

export interface PlotDetailsProps {
  className?: string;
  plot: PlotResult;
}

const PlotDetails = ({ className, plot }: PlotDetailsProps) => {
  const ingredientRegistry = useDIDependency(IngredientRegistry);

  const endsAt = last(plot.committedPoints) ?? PointZero;

  const [
    effects,
    baseCost,
    length,
    totalIngredients,
    totalUniqueIngredients,
    stress,
    longestDanger,
  ] = React.useMemo(() => {
    const allPoints = plot.committedPoints.concat(plot.pendingPoints);
    const sources = uniq(allPoints.map((point) => point.source));
    const ingredients = sources.filter(isIngredientPoint);

    const effects = getEffects(plot.committedPoints);

    let baseCost = 0;
    let ingredientTypeCounts: Record<string, number> = {};
    for (const { ingredientId } of ingredients) {
      const ingredient = ingredientRegistry.getIngredientById(ingredientId);
      if (!ingredient) {
        continue;
      }
      baseCost += ingredient.price;
      ingredientTypeCounts[ingredient.id] =
        (ingredientTypeCounts[ingredient.id] ?? 0) + 1;
    }

    const length = pointArrayLength(plot.committedPoints);

    const totalIngredients = ingredients.length;
    const totalUniqueIngredients = uniq(
      ingredients.map((x) => x.ingredientId)
    ).length;

    const stress = Math.sqrt(
      sum(
        Object.keys(ingredientTypeCounts).map((key) =>
          Math.pow(ingredientTypeCounts[key], 2)
        )
      )
    );

    const longestDanger = longestDangerLength(plot.committedPoints);

    return [
      effects,
      baseCost,
      length,
      totalIngredients,
      totalUniqueIngredients,
      stress,
      longestDanger,
    ];
  }, [plot, IngredientRegistry]);

  // PotionCraft subtract .4 health each unit of distance against a max of 1.
  const dangerIsDeath = longestDanger >= 2.5;

  return (
    <Card className={className} variant="outlined">
      <CardContent>
        <Typography variant="h6">Details</Typography>
        <table>
          <tbody>
            <tr>
              <td>
                <Typography>Possible Effects on Path:</Typography>
              </td>
              <td>
                <Typography variant="overline">
                  {Object.keys(effects)
                    .map((effect) => `${effect} (${effects[effect]})`)
                    .join(", ")}
                </Typography>
              </td>
            </tr>
            <tr>
              <td>
                <Typography>Ingredient count:</Typography>
              </td>
              <td>
                <Typography variant="overline">
                  {totalIngredients} ({totalUniqueIngredients} unique)
                </Typography>
              </td>
            </tr>
            <tr>
              <td>
                <Typography>Ingredient stress:</Typography>
              </td>
              <td>
                <Typography variant="overline">{stress.toFixed(2)}</Typography>
              </td>
            </tr>
            <tr>
              <td>
                <Typography>Base Cost:</Typography>
              </td>
              <td>
                <Typography variant="overline">{baseCost}</Typography>
              </td>
            </tr>
            <tr>
              <td>
                <Typography>Committed length:</Typography>
              </td>
              <td>
                <Typography variant="overline">{length.toFixed(2)}</Typography>
              </td>
            </tr>
            <tr>
              <td>
                <Typography>Ends at:</Typography>
              </td>
              <td>
                <Typography variant="overline">
                  {endsAt.x.toFixed(2)}, {endsAt.y.toFixed(2)}
                </Typography>
              </td>
            </tr>
            <tr>
              <td>
                <Typography>Longest length in bones:</Typography>
              </td>
              <td>
                <Typography
                  variant="overline"
                  color={dangerIsDeath ? "error" : "textPrimary"}
                >
                  {longestDanger.toFixed(2)} / 2.5
                </Typography>
              </td>
            </tr>
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};

export default PlotDetails;

export function isIngredientPoint(
  point: PlotItem
): point is AddIngredientPlotItem {
  return point.type === "add-ingredient";
}

function longestDangerLength(items: PlotPoint[]): number {
  let longestLength = 0;
  let currentLength = 0;
  let prevItem = items[0];
  for (let i = 1; i < items.length; i++) {
    const item = items[i];
    if (item.entities.some((x) => x.entityType === "DangerZonePart")) {
      currentLength += pointMagnitude(pointSubtract(item, prevItem));
    } else {
      longestLength = Math.max(longestLength, currentLength);
      currentLength = 0;
    }
    prevItem = item;
  }

  return Math.max(longestLength, currentLength);
}

function getEffects(items: PlotPoint[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const item of items) {
    const effect = item.entities.find(itemIsEffect);
    if (!effect) {
      continue;
    }

    const distance = pointMagnitude(pointSubtract(item, effect));
    const tier = getEffectTier(distance, 0);
    result[effect.effect] = Math.max(result[effect.effect] ?? 0, tier);
  }

  return result;
}

function itemIsEffect(item: MapEntity): item is PotionEffectMapEntity {
  return item.entityType === "PotionEffect";
}

function getEffectTier(distance: number, angleDegreesDelta: number): number {
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
