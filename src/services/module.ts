import { composeModules } from "microinject";

import ingredientsModule from "./ingredients/module";
import plotterModule from "./plotter/module";

export default composeModules(ingredientsModule, plotterModule);
