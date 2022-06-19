import { MAP_EXTENT_RADIUS } from "@/game-settings";
import { BehaviorSubject, combineLatest, Observable, map } from "rxjs";

import { PlotItem } from "../../../services/plotter/types";

import { PlotBuilderItemBase } from "./PlotBuilderItem";

export class SetPositionPlotBuilderItem extends PlotBuilderItemBase {
  private readonly _isValid$: Observable<boolean>;
  private readonly _x$ = new BehaviorSubject<number | null>(null);
  private readonly _y$ = new BehaviorSubject<number | null>(null);

  private readonly _plotItem$ = new BehaviorSubject<PlotItem | null>(null);

  constructor(private readonly _delete: (item: PlotBuilderItemBase) => void) {
    super();
    this._isValid$ = combineLatest([this._x$, this._y$]).pipe(
      map(() => this.isValid)
    );

    combineLatest([this._x$, this._y$]).subscribe(([x, y]) => {
      if (!this.isValid) {
        this._plotItem$.next(null);
        return;
      }

      this._plotItem$.next({
        type: "set-position",
        position: { x: x!, y: y! },
      });
    });
  }

  get isValid$() {
    return this._isValid$;
  }

  get isValid() {
    const x = this._x$.value;
    const y = this._y$.value;
    if (x == null || x < -MAP_EXTENT_RADIUS || x > MAP_EXTENT_RADIUS) {
      return false;
    }
    if (y == null || y < -MAP_EXTENT_RADIUS || y > MAP_EXTENT_RADIUS) {
      return false;
    }
    return true;
  }

  get plotItem$(): Observable<PlotItem | null> {
    return this._plotItem$;
  }

  get plotItem(): PlotItem | null {
    return this._plotItem$.value;
  }

  get x$(): Observable<number | null> {
    return this._x$;
  }

  get y$(): Observable<number | null> {
    return this._y$;
  }

  setX(x: number | null) {
    this._x$.next(x);
  }

  setY(y: number | null) {
    this._y$.next(y);
  }

  delete() {
    this._delete(this);
  }
}
