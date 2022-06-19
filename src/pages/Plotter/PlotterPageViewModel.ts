import { map, Observable, debounceTime } from "rxjs";
import pako from "pako";
import {
  encode as encodeBase64,
  decode as decodeBase64,
} from "base64-arraybuffer";
import { inject } from "microinject";

import { PotionBaseRegistry } from "@/services/potion-bases/PotionBaseRegistry";
import { PotionBaseId } from "@/services/potion-bases/types";
import { Plotter } from "@/services/plotter/Plotter";

import { PlotBuilderViewModel } from "@/components/PlotBuilderView/PlotBuilderViewModel";

export class PlotterPageViewModel extends PlotBuilderViewModel {
  private readonly _shareString$: Observable<string>;

  constructor(
    @inject(Plotter) plotter: Plotter,
    @inject(PotionBaseRegistry) potionBaseRegistry: PotionBaseRegistry
  ) {
    console.log(
      "PlotterPageViewModel.constructor",
      plotter.constructor.name,
      potionBaseRegistry.constructor.name
    );
    super(plotter);

    const waterMap = potionBaseRegistry.getPotionBaseById(
      "water" as PotionBaseId
    )!.map;
    this.setMap(waterMap);

    this._shareString$ = this.plotItems$.pipe(debounceTime(1000)).pipe(
      map((items) => {
        const encoded = pako.deflate(JSON.stringify(items));
        const data = new Uint8Array(1 + encoded.length);
        data.set(encoded, 1);
        new DataView(data.buffer).setUint8(0, 0);
        return encodeBase64(data);
      })
    );
  }

  get shareString$(): Observable<string> {
    return this._shareString$;
  }

  loadFromShareString(dataStr: string) {
    const array = decodeBase64(dataStr);
    const dv = new DataView(array);
    const version = dv.getUint8(0);
    const data = array.slice(1);
    if (version === 0) {
      const decoded = JSON.parse(pako.inflate(data, { to: "string" })) as any[];
      this.clear();
      this.loadPlotItems(decoded);
    }
  }
}
