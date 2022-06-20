import { ContainerModule } from "microinject";

import { ShareStringSerializer } from "./ShareStringSerializer";

export default new ContainerModule((bind) => {
  bind(ShareStringSerializer);
});
