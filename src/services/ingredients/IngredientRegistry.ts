import { cubicBezierCurve } from "@/curves";
import { injectable, singleton } from "microinject";

import { IngredientDescriptor, IngredientId } from "./types";

@injectable()
@singleton()
export class IngredientRegistry {
  getIngredient(id: IngredientId): IngredientDescriptor | null {
    if (id == "Windbloom") {
      return {
        id: "Windbloom" as IngredientId,
        path: [
          cubicBezierCurve(0, 0, 0.0001, 0, 0, 0, 0.5, 1.25),
          cubicBezierCurve(0.5, 1.25, 0.9999999, 2.5, 0.9999, 2.5, 1, 2.5),
          cubicBezierCurve(1, 2.5, 1.0001, 2.5, -1.0001, 2.5, -1, 2.5),
          cubicBezierCurve(-1, 2.5, -0.9999, 2.5, -1, 2.5, -0.5, 3.75),
          cubicBezierCurve(-0.5, 3.75, 0 /*-2.086163E-07*/, 5, 0.0001, 5, 0, 5),
        ],
        preGrindPercent: 0.5,
      };
    }
    throw new Error("Not Implemented");
  }
}
