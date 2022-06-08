import React from "react";
import { uniq, sum } from "lodash";

import { Card, CardContent, Typography } from "@mui/material";

import { useDIDependency } from "@/container";
import { pointArrayLength } from "@/point-array";

import {
  AddIngredientPlotItem,
  PlotItem,
  PlotResult,
} from "@/services/plotter/types";
import { IngredientRegistry } from "@/services/ingredients/IngredientRegistry";

export interface PlotDetailsProps {
  className?: string;
  plot: PlotResult;
}

const PlotDetails = ({ className, plot }: PlotDetailsProps) => {
  const ingredientRegistry = useDIDependency(IngredientRegistry);

  const [baseCost, length, totalIngredients, totalUniqueIngredients, stress] =
    React.useMemo(() => {
      const allPoints = plot.committedPoints.concat(plot.pendingPoints);
      const sources = uniq(allPoints.map((point) => point.source));
      const ingredients = sources.filter(isIngredientPoint);

      let baseCost = 0;
      let ingredientTypeCounts: Record<string, number> = {};
      for (const { ingredientId } of ingredients) {
        const ingredient = ingredientRegistry.getIngredient(ingredientId);
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

      return [
        baseCost,
        length,
        totalIngredients,
        totalUniqueIngredients,
        stress,
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
