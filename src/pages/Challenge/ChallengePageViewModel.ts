import { inject } from "microinject";
import { Observable, map } from "rxjs";

import { PlotBuilder } from "@/services/plotter/builder";
import { IChallenge } from "@/services/challenge/Challenge";
import { ChallengeFactory } from "@/services/challenge/ChallengeFactory";

import { PlotBuilderViewModel } from "@/components/PlotBuilderView/PlotBuilderViewModel";

export class ChallengePageViewModel extends PlotBuilderViewModel {
  private readonly _challenge: IChallenge;

  private readonly _score$: Observable<number | null>;

  constructor(
    @inject(ChallengeFactory) challengeFactory: ChallengeFactory,
    @inject(PlotBuilder) plotBuilder: PlotBuilder
  ) {
    super(plotBuilder);
    this._challenge = challengeFactory.createDailyChallenge();
    console.log("Got challenge", this._challenge);
    plotBuilder.setMap(this._challenge.map);
    this._score$ = plotBuilder.plotItems$.pipe(
      map((plotItems) => this._challenge.getScore(plotItems))
    );
  }

  get score$(): Observable<number | null> {
    return this._score$;
  }
}
