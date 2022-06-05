import { ContainerModule } from "microinject";

import { IngredientRegistry } from "./IngredientRegistry";

export default new ContainerModule((bind) => {
  bind(IngredientRegistry);
});
