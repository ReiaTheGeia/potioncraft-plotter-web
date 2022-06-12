import { Point } from "@/points";

import { IngredientId } from "../ingredients/types";
import { MapEntity } from "../potion-maps/types";

export type PlotItem =
  | AddIngredientPlotItem
  | PourSolventPlotItem
  | StirCauldronPlotItem
  | HeatVortexPlotItem;

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

export interface HeatVortexPlotItem {
  type: "heat-vortex";
  distance: number;
}

export interface PlotPoint extends Point {
  source: PlotItem;
  entities: Readonly<MapEntity>[];
}

export interface PlotResult {
  committedPoints: PlotPoint[];
  pendingPoints: PlotPoint[];
}

export const EmptyPlotResult: Readonly<PlotResult> = Object.freeze({
  committedPoints: [],
  pendingPoints: [],
}) as any;
