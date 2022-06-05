import { CubicBezierCurve } from "@/curves";
import { Opaque } from "type-fest";

export type IngredientId = Opaque<string, "IngredientName">;

export interface IngredientDescriptor {
  id: IngredientId;
  path: CubicBezierCurve[];
  preGrindPercent: number;
}
