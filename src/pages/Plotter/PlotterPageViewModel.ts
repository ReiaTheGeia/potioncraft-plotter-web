import { map, Observable, debounceTime } from "rxjs";
import pako from "pako";
import {
  encode as encodeBase64,
  decode as decodeBase64,
} from "base64-arraybuffer";
import { inject } from "microinject";

import { PlotBuilder } from "@/services/plotter/builder/PlotBuilder";
import { PotionBaseRegistry } from "@/services/potion-bases/PotionBaseRegistry";
import { PotionBaseId } from "@/services/potion-bases/types";

import { PlotBuilderViewModel } from "@/components/PlotBuilderView/PlotBuilderViewModel";

export class PlotterPageViewModel extends PlotBuilderViewModel {
  private readonly _shareString$: Observable<string>;

  constructor(
    @inject(PlotBuilder) builder: PlotBuilder,
    @inject(PotionBaseRegistry) potionBaseRegistry: PotionBaseRegistry
  ) {
    super(builder);

    const waterMap = potionBaseRegistry.getPotionBaseById(
      "water" as PotionBaseId
    )!.map;
    builder.setMap(waterMap);

    this._shareString$ = builder.plotItems$.pipe(debounceTime(1000)).pipe(
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
      this.builder.clear();
      for (const item of decoded) {
        switch (item.type) {
          case "add-ingredient":
            this.builder.addIngredient(item);
            break;
          case "stir-cauldron":
            this.builder.addStirCauldron(item);
            break;
          case "pour-solvent":
            this.builder.addPourSolvent(item);
            break;
          case "heat-vortex":
            this.builder.addHeatVortex(item);
            break;
          default:
            throw new Error(`Unknown item type: ${item.type}`);
        }
      }
    }
  }
}
