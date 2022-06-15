import { PlotItem } from "../plotter/types";
import { PotionMap } from "../potion-maps/PotionMap";

export interface ChallengeScoreItem {
  value: string;
  score: number;
}

export type ChallengeResults = Record<string, ChallengeScoreItem>;
export interface IChallenge {
  readonly map: PotionMap;
  readonly description: string;
  getScore(plotItems: readonly PlotItem[]): ChallengeResults | null;
}
