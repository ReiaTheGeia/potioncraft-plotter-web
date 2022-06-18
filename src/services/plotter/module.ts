import { ContainerModule } from "microinject";

import { PlotBuilder } from "../../components/PlotBuilderView/builder/PlotBuilder";
import { Plotter } from "./Plotter";

export default new ContainerModule((bind) => {
  bind(PlotBuilder);
  bind(Plotter);
});
