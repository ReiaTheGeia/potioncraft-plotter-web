import { PlotItem } from "../plotter/types";
import { PotionMap } from "../potion-maps/PotionMap";

export interface IChallenge {
  readonly map: PotionMap;
  getScore(plotItems: readonly PlotItem[]): number | null;
}
