import { ContainerModule } from "microinject";

import { PlotBuilder } from "./PlotBuilder";
import { Plotter } from "./Plotter";

export default new ContainerModule((bind) => {
  bind(PlotBuilder);
  bind(Plotter);
});
