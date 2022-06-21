import { Vector2 } from "@/vector2";

import { IngredientId } from "../ingredients/types";
import { MapEntity } from "../potion-maps/types";

export interface SetPositionPlotItem {
  type: "set-position";
  x: number;
  y: number;
}
const SetPositionPlotItemKeys = ["x", "y"] as const;

export interface AddIngredientPlotItem {
  type: "add-ingredient";
  ingredientId: IngredientId;
  grindPercent: number;
}
const AddIngredientPlotItemKeys = ["ingredientId", "grindPercent"] as const;
export function isIngredientPlotItem(
  item: PlotItem
): item is AddIngredientPlotItem {
  return item.type === "add-ingredient";
}

export interface PourSolventPlotItem {
  type: "pour-solvent";
  distance: number;
}
const PourSolventPlotItemKeys = ["distance"] as const;

export interface StirCauldronPlotItem {
  type: "stir-cauldron";
  distance: number;
}
const StirCauldronPlotItemKeys = ["distance"] as const;

export interface HeatVortexPlotItem {
  type: "heat-vortex";
  distance: number;
}
const HeatVortexPlotItemKeys = ["distance"] as const;

export interface AddVoidSaltPlotItem {
  type: "void-salt";
  grains: number;
}
const AddVoidSaltPlotItemKeys = ["grains"] as const;
export function isVoidSaltPlotItem(
  item: PlotItem
): item is AddVoidSaltPlotItem {
  return item.type === "void-salt";
}

export type PlotItem =
  | SetPositionPlotItem
  | AddIngredientPlotItem
  | PourSolventPlotItem
  | StirCauldronPlotItem
  | HeatVortexPlotItem
  | AddVoidSaltPlotItem;

export const PlotItemKeysByType: Record<PlotItem["type"], readonly string[]> = {
  "set-position": SetPositionPlotItemKeys,
  "add-ingredient": AddIngredientPlotItemKeys,
  "pour-solvent": PourSolventPlotItemKeys,
  "stir-cauldron": StirCauldronPlotItemKeys,
  "heat-vortex": HeatVortexPlotItemKeys,
  "void-salt": AddVoidSaltPlotItemKeys,
};

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
