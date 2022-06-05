import { Point } from "@/points";

import { IngredientId } from "../ingredients/types";

export type PlotItem =
  | AddIngredientPlotItem
  | PourSolventPlotItem
  | StirCauldronPlotItem;

export interface AddIngredientPlotItem {
  type: "add-ingredient";
  ingredientId: IngredientId;
  grindPercent: number;
}

export interface PourSolventPlotItem {
  type: "pour-solvent";
  distance: number;
}

export interface StirCauldronPlotItem {
  type: "stir-cauldron";
  distance: number;
}

export interface PlotPoint extends Point {
  source: PlotItem;
}

export interface PlotResult {
  committedPoints: PlotPoint[];
  pendingPoints: PlotPoint[];
}
