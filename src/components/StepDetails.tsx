import React from "react";

import { Card, CardContent, Typography, styled } from "@mui/material";

import { useDIDependency } from "@/container";

import { CubicBezierCurve } from "@/curves";
import { MAX_INGREDIENT_EXTENT, POTION_RADIUS } from "@/game-settings";

import { AddIngredientPlotItem, PlotItem } from "@/services/plotter/types";
import { IngredientRegistry } from "@/services/ingredients/IngredientRegistry";

export interface StepDetailsProps {
  className?: string;
  step: PlotItem;
}

const StepDetails = ({ step, className }: StepDetailsProps) => {
  let content: React.ReactNode;
  switch (step.type) {
    case "add-ingredient":
      content = <AddIngredient step={step} />;
      break;
    default:
      return null;
  }

  return (
    <Card className={className} variant="outlined">
      <CardContent>{content}</CardContent>
    </Card>
  );
};

interface AddIngredientStepProps {
  step: AddIngredientPlotItem;
}

const AddIngredientRoot = styled("div")({
  "& .svg-container": {
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
});
const AddIngredient = ({ step }: AddIngredientStepProps) => {
  const ingredientRegistry = useDIDependency(IngredientRegistry);
  const ingredient = ingredientRegistry.getIngredientById(
    step.ingredientId
  ) ?? {
    name: "Unknown",
    path: [] as CubicBezierCurve[],
  };

  const path = ingredient.path.reduce(
    (path, curve) =>
      path +
      `M ${curve.start.x} ${curve.start.y} C ${curve.p1.x},${curve.p1.y} ${curve.p2.x},${curve.p2.y} ${curve.end.x},${curve.end.y}`,
    "M 0 0 "
  );
  return (
    <AddIngredientRoot>
      <Typography variant="h6">Ingredient</Typography>
      <Typography variant="overline">{ingredient.name}</Typography>
      <div>
        <Typography>Grind Percentage</Typography>
        <Typography variant="overline">{step.grindPercent}</Typography>
      </div>
      <div className="svg-container">
        <svg
          width="100px"
          height="100px"
          viewBox={`-${MAX_INGREDIENT_EXTENT} -${MAX_INGREDIENT_EXTENT} ${
            MAX_INGREDIENT_EXTENT * 2
          } ${MAX_INGREDIENT_EXTENT * 2}`}
          transform="scale(1, -1)"
        >
          <circle cx={0} cy={0} r={POTION_RADIUS} fill="blue" />
          <path d={path} stroke="black" strokeWidth={0.2} fill="none" />
        </svg>
      </div>
    </AddIngredientRoot>
  );
};

export default StepDetails;
