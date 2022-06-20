import { BehaviorSubject, combineLatest, Observable, map } from "rxjs";

import { PlotItem } from "../../../services/plotter/types";

import { PlotBuilderItemBase } from "./PlotBuilderItem";

export class PourSolventPlotBuilderItem extends PlotBuilderItemBase {
  private readonly _isValid$: Observable<boolean>;
  private readonly _distance$ = new BehaviorSubject<number | null>(null);

  private readonly _plotItem$ = new BehaviorSubject<PlotItem | null>(null);

  constructor(private readonly _delete: (item: PlotBuilderItemBase) => void) {
    super();
    this._isValid$ = combineLatest([this._distance$]).pipe(
      map(() => this.isValid)
    );

    combineLatest([this._distance$]).subscribe(([distance]) => {
      if (!this.isValid) {
        this._plotItem$.next(null);
        return;
      }

      this._plotItem$.next({
        type: "pour-solvent",
        distance: distance!,
      });
    });
  }

  get isValid$() {
    return this._isValid$;
  }

  get isValid() {
    const distance = this._distance$.value;
    return distance != null && distance >= 0;
  }

  get plotItem$(): Observable<PlotItem | null> {
    return this._plotItem$;
  }

  get plotItem(): PlotItem | null {
    return this._plotItem$.value;
  }

  get distance$(): Observable<number | null> {
    return this._distance$;
  }

  setDistance(distance: number | null) {
    this._distance$.next(distance);
  }

  delete() {
    this._delete(this);
  }
}