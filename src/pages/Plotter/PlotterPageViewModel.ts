import {
  BehaviorSubject,
  map,
  Observable,
  combineLatest,
  debounceTime,
} from "rxjs";
import { first } from "lodash";

import { inject } from "microinject";

import { vec2Distance } from "@/vector2";

import { MAP_EXTENT_RADIUS } from "@/game-settings";

import { PlotBuilder } from "@/services/plotter/builder/PlotBuilder";
import { PlotBuilderItem } from "@/services/plotter/builder/PlotBuilderItem";
import { PlotItem, PlotPoint } from "@/services/plotter/types";
import { MapEntity } from "@/services/potion-maps/types";
import { PotionBaseRegistry } from "@/services/potion-bases/PotionBaseRegistry";
import { PotionBaseId } from "@/services/potion-bases/types";

import { IPlotViewModel } from "@/components/Plot/PlotViewModel";
import { IPanZoomViewportViewModel } from "@/components/PanZoomViewport/PanZoomViewportViewModel";
import { CoordinateMappingViewportViewModel } from "@/components/PanZoomViewport/CoordinateMappingViewportViewModel";

export class PlotterPageViewModel
  extends CoordinateMappingViewportViewModel
  implements IPlotViewModel, IPanZoomViewportViewModel
{
  private readonly _shareString$: Observable<string>;

  private readonly _mouseOverPlotItem$ = new BehaviorSubject<PlotItem | null>(
    null
  );
  private readonly _mouseOverBuilderItem$ =
    new BehaviorSubject<PlotBuilderItem | null>(null);
  private readonly _mouseOverEntity$: Observable<MapEntity | null>;

  private readonly _mouseOverPlotPoint$: Observable<PlotPoint | null>;

  constructor(
    @inject(PlotBuilder) private readonly _builder: PlotBuilder,
    @inject(PotionBaseRegistry) potionBaseRegistry: PotionBaseRegistry
  ) {
    super(
      { width: MAP_EXTENT_RADIUS * 2, height: MAP_EXTENT_RADIUS * 2 },
      { x: MAP_EXTENT_RADIUS, y: MAP_EXTENT_RADIUS },
      { x: 1, y: -1 }
    );

    const waterMap = potionBaseRegistry.getPotionBaseById(
      "water" as PotionBaseId
    )!.map;
    _builder.setMap(waterMap);

    this._shareString$ = this._builder.plot$
      .pipe(debounceTime(1000))
      .pipe(map((x) => this._builder.getShareString()));

    this._mouseOverEntity$ = combineLatest([
      this.mouseWorldPosition$,
      _builder.map$,
    ]).pipe(
      map(([worldPos, map]) => {
        if (!worldPos || !map) {
          return null;
        }

        const entities = map.hitTest(worldPos) ?? [];
        const entity = first(entities);
        return entity ?? null;
      })
    );

    this._mouseOverPlotPoint$ = combineLatest([
      this.mouseWorldPosition$,
      this._mouseOverPlotItem$,
      this._builder.plot$,
    ]).pipe(
      map(([worldPos, plotItem, plot]) => {
        if (!worldPos || !plotItem || !plot) {
          return null;
        }

        const plotPoints = plot.committedPoints.concat(plot.pendingPoints);
        const plotItemPoints = plotPoints.filter((x) => x.source === plotItem);

        let closestPlotItem = first(plotItemPoints);
        if (!closestPlotItem) {
          return null;
        }

        for (let i = 1; i < plotItemPoints.length; i++) {
          const point = plotItemPoints[i];
          if (
            vec2Distance(worldPos, point) <
            vec2Distance(worldPos, closestPlotItem)
          ) {
            closestPlotItem = point;
          }
        }

        return closestPlotItem;
      })
    );
  }

  get builder(): PlotBuilder {
    return this._builder;
  }

  get shareString$(): Observable<string> {
    return this._shareString$;
  }

  get mouseOverPlotItem$(): Observable<PlotItem | null> {
    return this._mouseOverPlotItem$;
  }

  get mouseOverBuilderItem$(): Observable<PlotBuilderItem | null> {
    return this._mouseOverBuilderItem$;
  }

  get mouseOverEntity$(): Observable<MapEntity | null> {
    return this._mouseOverEntity$;
  }

  get mouseOverPlotPoint(): Observable<PlotPoint | null> {
    return this._mouseOverPlotPoint$;
  }

  onMouseOverPlotItem(item: PlotItem | null): void {
    this._mouseOverPlotItem$.next(item);
    this._mouseOverBuilderItem$.next(
      item ? this._builder.builderItemFor(item) : null
    );
  }

  onMouseOverBuilderItem(item: PlotBuilderItem | null): void {
    this._mouseOverBuilderItem$.next(item);
    this._mouseOverPlotItem$.next(item ? item.plotItem : null);
  }
}
