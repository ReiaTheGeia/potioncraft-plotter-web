import { inject } from "microinject";
import { Observable, map } from "rxjs";

import { ChallengeResults, IChallenge } from "@/services/challenge/Challenge";
import { ChallengeFactory } from "@/services/challenge/ChallengeFactory";
import { Plotter } from "@/services/plotter/Plotter";

import { PlotBuilderViewModel } from "@/components/PlotBuilderView/PlotBuilderViewModel";

export class ChallengePageViewModel extends PlotBuilderViewModel {
  private readonly _challenge: IChallenge;

  private readonly _results$: Observable<ChallengeResults | null>;

  constructor(
    @inject(ChallengeFactory) challengeFactory: ChallengeFactory,
    @inject(Plotter) plotter: Plotter
  ) {
    super(plotter);
    this._challenge = challengeFactory.createDailyChallenge();
    this.setMap(this._challenge.map);
    this._results$ = this.plotItems$.pipe(
      map((plotItems) => this._challenge.getScore(plotItems))
    );
  }

  get description(): string {
    return this._challenge.description;
  }

  get results$(): Observable<ChallengeResults | null> {
    return this._results$;
  }
}
