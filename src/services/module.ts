import { composeModules } from "microinject";

import historyModule from "./history/module";
import ingredientsModule from "./ingredients/module";
import plotterModule from "./plotter/module";
import potionBasesModule from "./potion-bases/module";

export default composeModules(
  historyModule,
  ingredientsModule,
  plotterModule,
  potionBasesModule
);
