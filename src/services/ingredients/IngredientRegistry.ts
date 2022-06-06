import { injectable, singleton } from "microinject";

import { ingredients } from "./ingredients";
import { IngredientDescriptor, IngredientId } from "./types";

@injectable()
@singleton()
export class IngredientRegistry {
  getIngredient(id: IngredientId): IngredientDescriptor | null {
    return ingredients.find((x) => x.id === id) ?? null;
  }
}
