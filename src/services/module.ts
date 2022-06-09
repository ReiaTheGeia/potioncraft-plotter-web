import { composeModules } from "microinject";

import ingredientsModule from "./ingredients/module";
import plotterModule from "./plotter/module";
import potionBasesModule from "./potion-bases/module";

export default composeModules(
  ingredientsModule,
  plotterModule,
  potionBasesModule
);
