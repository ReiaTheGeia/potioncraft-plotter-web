import { ContainerModule } from "microinject";

import { Plotter } from "./Plotter";

export default new ContainerModule((bind) => {
  bind(Plotter);
});
