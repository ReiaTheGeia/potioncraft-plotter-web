import { ContainerModule } from "microinject";
import { PotionBaseRegistry } from "./PotionBaseRegistry";

export default new ContainerModule((bind) => {
  bind(PotionBaseRegistry);
});
