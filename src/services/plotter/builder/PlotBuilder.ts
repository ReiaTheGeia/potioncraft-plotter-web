import { inject, injectable } from "microinject";
import { BehaviorSubject, combineLatest, Observable, Subscription } from "rxjs";

import { isNotNull } from "@/utils";

import { PotionMap } from "../../potion-maps/PotionMap";

import { Plotter } from "../Plotter";
import { PlotResult } from "../types";

import { PlotBuilderItemCollection } from "./PlotBuilderItemCollection";

@injectable()
export class PlotBuilder extends PlotBuilderItemCollection {
  private readonly _map$ = new BehaviorSubject<PotionMap | null>(null);
  private _itemSubscription: Subscription | null = null;
  private readonly _plot$ = new BehaviorSubject<Readonly<PlotResult> | null>(
    null
  );

  constructor(@inject(Plotter) plotter: Plotter) {
    super();
    // This is a little wonky, but subscribing to all observables in an observable array is something I could see wanting to do a lot.
    // Should make a utility function to handle this use case, if one doesnt already exist in rxjs.
    this.items$.subscribe((items) => {
      if (this._itemSubscription) {
        this._itemSubscription.unsubscribe();
      }

      if (items.length === 0) {
        this._plot$.next(null);
        return;
      }

      this._itemSubscription = combineLatest([
        this._map$,
        ...items.map((x) => x.plotItem$),
      ]).subscribe(([map, ...plotItems]) => {
        if (map == null) {
          return null;
        }
        this._plot$.next(plotter.plotItems(plotItems.filter(isNotNull), map));
      });
    });
  }

  get map$(): Observable<PotionMap | null> {
    return this._map$;
  }

  get plot$(): Observable<Readonly<PlotResult> | null> {
    return this._plot$;
  }

  setMap(map: PotionMap) {
    this._map$.next(map);
  }
}
