import { CubicBezierCurve } from "@/curves";
import { Opaque } from "type-fest";

export type IngredientId = Opaque<string, "IngredientName">;
export function ingredientId(id: string): IngredientId {
  return id as IngredientId;
}

export interface IngredientDescriptor {
  id: IngredientId;
  path: CubicBezierCurve[];
  preGrindPercent: number;
}
