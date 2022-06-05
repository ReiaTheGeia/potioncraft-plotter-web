import { inject, injectable } from "microinject";
import { BehaviorSubject, map, Observable } from "rxjs";

import { Plotter } from "./Plotter";
import { PlotItem, PlotResult } from "./types";

@injectable()
export class PlotBuilder {
  private readonly _items$ = new BehaviorSubject<readonly PlotItem[]>([]);
  private readonly _plot$: Observable<PlotResult>;

  constructor(@inject(Plotter) plotter: Plotter) {
    this._plot$ = this._items$.pipe(map((items) => plotter.plotItems(items)));
  }

  get items$() {
    return this._items$;
  }

  get plot$() {
    return this._plot$;
  }

  addItem(item: PlotItem): void {
    this._items$.next([...this._items$.value, item]);
  }
}
