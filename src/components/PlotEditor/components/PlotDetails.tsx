import React from "react";
import { uniq, sum } from "lodash";

import { Card, CardContent, Typography } from "@mui/material";

import { useDIDependency } from "@/container";
import { pointArrayLength } from "@/point-array";
import { pointMagnitude, pointSubtract } from "@/points";

import {
  AddIngredientPlotItem,
  PlotItem,
  PlotPoint,
  PlotResult,
} from "@/services/plotter/types";
import { IngredientRegistry } from "@/services/ingredients/IngredientRegistry";

export interface PlotDetailsProps {
  className?: string;
  plot: PlotResult;
}

const PlotDetails = ({ className, plot }: PlotDetailsProps) => {
  const ingredientRegistry = useDIDependency(IngredientRegistry);

  const [
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
      baseCost,
      length,
      totalIngredients,
      totalUniqueIngredients,
      stress,
      longestDanger,
    ];
  }, [plot, IngredientRegistry]);

  return (
    <Card className={className} variant="outlined">
      <CardContent>
        <Typography variant="h6">Details</Typography>
        <div>
          <Typography>Ingredient count: </Typography>
          <Typography variant="overline">
            {totalIngredients} ({totalUniqueIngredients} unique)
          </Typography>
        </div>
        <div>
          <Typography>Ingredient stress: </Typography>
          <Typography variant="overline">{stress.toFixed(2)}</Typography>
        </div>
        <div>
          <Typography>Base Cost: </Typography>
          <Typography variant="overline">{baseCost}</Typography>
        </div>
        <div>
          <Typography>Committed length: </Typography>
          <Typography variant="overline">{length.toFixed(2)}</Typography>
        </div>
        <div>
          <Typography>Longest length in danger: </Typography>
          <Typography variant="overline">{longestDanger.toFixed(2)}</Typography>
        </div>
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
