import { Vector2 } from "@/vector2";

import { IngredientId } from "../ingredients/types";
import { MapEntity } from "../potion-maps/types";

export type PlotItem =
  | SetPositionPlotItem
  | AddIngredientPlotItem
  | PourSolventPlotItem
  | StirCauldronPlotItem
  | HeatVortexPlotItem
  | AddVoidSaltPlotItem;

export interface SetPositionPlotItem {
  type: "set-position";
  position: Vector2;
}

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

export interface AddVoidSaltPlotItem {
  type: "void-salt";
  grains: number;
}

export interface PlotPoint extends Vector2 {
  source: PlotItem;
  bottleCollisions: Readonly<MapEntity>[];
}

export interface PlotResult {
  committedPoints: PlotPoint[];
  pendingPoints: PlotPoint[];
}

export const EmptyPlotResult: Readonly<PlotResult> = Object.freeze({
  committedPoints: [],
  pendingPoints: [],
}) as any;
