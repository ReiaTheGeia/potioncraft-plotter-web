import { Vector2 } from "@/vector2";

import { IngredientId } from "../ingredients/types";
import { MapEntity } from "../potion-maps/types";

export interface SetPositionPlotItem {
  type: "set-position";
  x: number;
  y: number;
}
const SetPositionPlotItemKeys = ["x", "y"] as const;
export const DefaultSetPositionPlotItem = Object.freeze({
  type: "set-position",
  x: 0,
  y: 0,
});
export function isValidSetPositionPlotItem(item: SetPositionPlotItem) {
  return true;
}

export interface AddIngredientPlotItem {
  type: "add-ingredient";
  ingredientId: IngredientId;
  grindPercent: number;
}
const AddIngredientPlotItemKeys = ["ingredientId", "grindPercent"] as const;
export const DefaultAddIngredientPlotItem = Object.freeze({
  type: "add-ingredient",
  ingredientId: null as any as IngredientId,
  grindPercent: 1,
});
export function isValidAddIngredientPlotItem(
  item: AddIngredientPlotItem
): boolean {
  const { ingredientId, grindPercent } = item;
  return (
    ingredientId != null &&
    ingredientId !== "" &&
    grindPercent >= 0 &&
    grindPercent <= 1
  );
}
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
export const DefaultPourSolventPlotItem = Object.freeze({
  type: "pour-solvent",
  distance: 0,
});
export function isValidPourSolventPlotItem(item: PourSolventPlotItem) {
  return item.distance >= 0;
}

export interface StirCauldronPlotItem {
  type: "stir-cauldron";
  distance: number;
}
export const DefaultStirCauldronPlotItem = Object.freeze({
  type: "stir-cauldron",
  distance: 0,
});
export function isValidStirCauldronPlotItem(item: StirCauldronPlotItem) {
  return item.distance >= 0;
}
const StirCauldronPlotItemKeys = ["distance"] as const;

export interface HeatVortexPlotItem {
  type: "heat-vortex";
  distance: number;
}
const HeatVortexPlotItemKeys = ["distance"] as const;
export const DefaultHeatVortexPlotItem = Object.freeze({
  type: "heat-vortex",
  distance: 0,
});
export function isValidHeatVortexPlotItem(item: HeatVortexPlotItem) {
  return item.distance >= 0;
}

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
export const DefaultAddVoidSaltPlotItemItem = Object.freeze({
  type: "void-salt",
  grains: 0,
});
export function isValidAddVoidSaltPlotItem(item: AddVoidSaltPlotItem) {
  return item.grains >= 0;
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

export const DefaultPlotItemByType: Record<
  PlotItem["type"],
  Readonly<PlotItem>
> = {
  "set-position": DefaultSetPositionPlotItem,
  "add-ingredient": DefaultAddIngredientPlotItem,
  "pour-solvent": DefaultPourSolventPlotItem,
  "stir-cauldron": DefaultStirCauldronPlotItem,
  "heat-vortex": DefaultHeatVortexPlotItem,
  "void-salt": DefaultAddVoidSaltPlotItemItem,
};

export const PlotItemValidatorByType: Record<
  PlotItem["type"],
  (value: any) => boolean
> = {
  "set-position": isValidSetPositionPlotItem,
  "add-ingredient": isValidAddIngredientPlotItem,
  "pour-solvent": isValidPourSolventPlotItem,
  "stir-cauldron": isValidStirCauldronPlotItem,
  "heat-vortex": isValidHeatVortexPlotItem,
  "void-salt": isValidAddVoidSaltPlotItem,
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
