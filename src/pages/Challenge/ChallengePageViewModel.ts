import { inject } from "microinject";
import { Observable, map } from "rxjs";

import { PlotBuilder } from "@/services/plotter/builder";
import { ChallengeResults, IChallenge } from "@/services/challenge/Challenge";
import { ChallengeFactory } from "@/services/challenge/ChallengeFactory";

import { PlotBuilderViewModel } from "@/components/PlotBuilderView/PlotBuilderViewModel";

export class ChallengePageViewModel extends PlotBuilderViewModel {
  private readonly _challenge: IChallenge;

  private readonly _results$: Observable<ChallengeResults | null>;

  constructor(
    @inject(ChallengeFactory) challengeFactory: ChallengeFactory,
    @inject(PlotBuilder) plotBuilder: PlotBuilder
  ) {
    super(plotBuilder);
    this._challenge = challengeFactory.createDailyChallenge();
    console.log("Got challenge", this._challenge);
    plotBuilder.setMap(this._challenge.map);
    this._results$ = plotBuilder.plotItems$.pipe(
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
