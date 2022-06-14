import { composeModules } from "microinject";

import challengeModule from "./challenge/module";
import historyModule from "./history/module";
import ingredientsModule from "./ingredients/module";
import plotterModule from "./plotter/module";
import potionBasesModule from "./potion-bases/module";

export default composeModules(
  challengeModule,
  historyModule,
  ingredientsModule,
  plotterModule,
  potionBasesModule
);
