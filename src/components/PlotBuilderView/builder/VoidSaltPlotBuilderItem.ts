import { BehaviorSubject, combineLatest, Observable, map } from "rxjs";

import { PlotItem } from "../../../services/plotter/types";

import { PlotBuilderItemBase } from "./PlotBuilderItem";

export class VoidSaltPlotBuilderItem extends PlotBuilderItemBase {
  private readonly _isValid$: Observable<boolean>;
  private readonly _grains$ = new BehaviorSubject<number | null>(null);

  private readonly _plotItem$ = new BehaviorSubject<PlotItem | null>(null);

  constructor(private readonly _delete: (item: PlotBuilderItemBase) => void) {
    super();
    this._isValid$ = combineLatest([this._grains$]).pipe(
      map(() => this.isValid)
    );

    combineLatest([this._grains$]).subscribe(([grains]) => {
      if (!this.isValid) {
        this._plotItem$.next(null);
        return;
      }

      this._plotItem$.next({
        type: "void-salt",
        grains: grains!,
      });
    });
  }

  get isValid$() {
    return this._isValid$;
  }

  get isValid() {
    const grains = this._grains$.value;
    return grains != null && grains >= 0 && grains === Math.round(grains);
  }

  get plotItem$(): Observable<PlotItem | null> {
    return this._plotItem$;
  }

  get plotItem(): PlotItem | null {
    return this._plotItem$.value;
  }

  get grains$(): Observable<number | null> {
    return this._grains$;
  }

  setGrains(grains: number | null) {
    this._grains$.next(grains);
  }

  delete() {
    this._delete(this);
  }
}
