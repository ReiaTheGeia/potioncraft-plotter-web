import { map, Observable, debounceTime } from "rxjs";
import { inject } from "microinject";

import { PotionBaseRegistry } from "@/services/potion-bases/PotionBaseRegistry";
import { PotionBaseId } from "@/services/potion-bases/types";
import { Plotter } from "@/services/plotter/Plotter";
import { ShareStringSerializer } from "@/services/share-string/ShareStringSerializer";

import { PlotBuilderViewModel } from "@/components/PlotBuilderView/PlotBuilderViewModel";

export class PlotterPageViewModel extends PlotBuilderViewModel {
  private readonly _shareString$: Observable<string>;

  constructor(
    @inject(Plotter) plotter: Plotter,
    @inject(PotionBaseRegistry) potionBaseRegistry: PotionBaseRegistry,
    @inject(ShareStringSerializer)
    private readonly _shareStringSerializer: ShareStringSerializer
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

    this._shareString$ = this.plotItems$
      .pipe(debounceTime(1000))
      .pipe(map((items) => this._shareStringSerializer.serialize(items)));
  }

  get shareString$(): Observable<string> {
    return this._shareString$;
  }

  loadFromShareString(dataStr: string) {
    const items = this._shareStringSerializer.deserialize(dataStr);
    this.clear();
    this.loadPlotItems(items);
  }
}
