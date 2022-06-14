import { inject } from "microinject";

import { IChallenge } from "@/services/challenge/Challenge";
import { ChallengeFactory } from "@/services/challenge/ChallengeFactory";

export class ChallengePageViewModel {
  private readonly _challenge: IChallenge;

  constructor(@inject(ChallengeFactory) challengeFactory: ChallengeFactory) {
    this._challenge = challengeFactory.createDailyChallenge();
  }
}
