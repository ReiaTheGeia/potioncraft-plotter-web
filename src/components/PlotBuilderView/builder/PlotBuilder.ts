import { inject, injectable } from "microinject";
import { BehaviorSubject, combineLatest, map, Observable } from "rxjs";

import { isNotNull } from "@/utils";

import { PotionMap } from "../../../services/potion-maps/PotionMap";

import { Plotter } from "../../../services/plotter/Plotter";
import { PlotResult } from "../../../services/plotter/types";

import { PlotBuilderItemCollection } from "./PlotBuilderItemCollection";

@injectable()
export class PlotBuilder extends PlotBuilderItemCollection {
  private readonly _map$ = new BehaviorSubject<PotionMap | null>(null);
  private readonly _plot$: Observable<Readonly<PlotResult> | null>;

  constructor(@inject(Plotter) plotter: Plotter) {
    super();
    this._plot$ = combineLatest([this._map$, this.plotItems$]).pipe(
      map(([map, plotItems]) => {
        if (map == null) {
          return null;
        }
        return plotter.plotItems(plotItems.filter(isNotNull), map);
      })
    );
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
