import { inject, injectable } from "microinject";
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  Subscription,
} from "rxjs";
import pako from "pako";
import {
  encode as encodeBase64,
  decode as decodeBase64,
} from "base64-arraybuffer";

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

  loadFromShareString(dataStr: string) {
    const array = decodeBase64(dataStr);
    const dv = new DataView(array);
    const version = dv.getUint8(0);
    const data = array.slice(1);
    if (version === 0) {
      const decoded = JSON.parse(pako.inflate(data, { to: "string" })) as any[];
      this.clear();
      for (const item of decoded) {
        switch (item.type) {
          case "add-ingredient":
            return this.addIngredient(item);
          case "stir-cauldron":
            return this.addStirCauldron(item);
          case "pour-solvent":
            return this.addPourSolvent(item);
          case "heat-vortex":
            return this.addHeatVortex(item);
          default:
            throw new Error(`Unknown item type: ${item.type}`);
        }
      }
    }
  }

  getShareString() {
    const items = this.items.map((x) => x.plotItem);
    const encoded = pako.deflate(JSON.stringify(items));
    const data = new Uint8Array(1 + encoded.length);
    data.set(encoded, 1);
    new DataView(data.buffer).setUint8(0, 0);
    return encodeBase64(data);
  }

  setMap(map: PotionMap) {
    this._map$.next(map);
  }
}
