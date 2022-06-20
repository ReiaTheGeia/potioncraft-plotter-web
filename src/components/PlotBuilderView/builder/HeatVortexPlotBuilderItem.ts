import { BehaviorSubject, combineLatest, Observable, map } from "rxjs";

import { HeatVortexPlotItem, PlotItem } from "@/services/plotter/types";

import { PlotBuilderItem } from "./PlotBuilderItem";

export class HeatVortexPlotBuilderItem
  implements PlotBuilderItem<HeatVortexPlotItem>
{
  private readonly _isValid$: Observable<boolean>;
  private readonly _distance$ = new BehaviorSubject<number | null>(null);

  private readonly _plotItem$ = new BehaviorSubject<PlotItem | null>(null);

  constructor(private readonly _delete: (item: PlotBuilderItem) => void) {
    this._isValid$ = combineLatest([this._distance$]).pipe(
      map(() => this.isValid)
    );

    combineLatest([this._distance$]).subscribe(([distace]) => {
      if (!this.isValid) {
        this._plotItem$.next(null);
        return;
      }

      this._plotItem$.next({
        type: "heat-vortex",
        distance: distace!,
      });
    });
  }

  get type() {
    return "heat-vortex" as const;
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
