import React from "react";
import { uniq, sum, clamp, last } from "lodash";

import { Card, CardContent, Typography } from "@mui/material";

import { useDIDependency } from "@/container";
import { pointArrayLength } from "@/point-array";
import { vec2Magnitude, vec2Subtract, Vec2Zero } from "@/vector2";

import {
  AddIngredientPlotItem,
  PlotItem,
  PlotPoint,
  PlotResult,
} from "@/services/plotter/types";
import { IngredientRegistry } from "@/services/ingredients/IngredientRegistry";
import { MapEntity, PotionEffectMapEntity } from "@/services/potion-maps/types";
import { getEffectTier, longestDangerLength } from "@/services/plotter/utils";
import { DANGER_LENGTH_LETHAL } from "@/game-settings";

export interface PlotDetailsProps {
  className?: string;
  plot: PlotResult;
}

const PlotDetails = ({ className, plot }: PlotDetailsProps) => {
  const ingredientRegistry = useDIDependency(IngredientRegistry);

  const endsAt = last(plot.committedPoints) ?? Vec2Zero;

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
  const dangerIsDeath = longestDanger >= DANGER_LENGTH_LETHAL;

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
                  {longestDanger.toFixed(2)} / {DANGER_LENGTH_LETHAL}
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

function getEffects(items: PlotPoint[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const item of items) {
    const effect = item.entities.find(itemIsEffect);
    if (!effect) {
      continue;
    }

    const distance = vec2Magnitude(vec2Subtract(item, effect));
    const tier = getEffectTier(distance, 0);
    result[effect.effect] = Math.max(result[effect.effect] ?? 0, tier);
  }

  return result;
}

function itemIsEffect(item: MapEntity): item is PotionEffectMapEntity {
  return item.entityType === "PotionEffect";
}
