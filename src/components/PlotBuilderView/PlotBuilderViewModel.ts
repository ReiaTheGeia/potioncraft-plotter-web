import { BehaviorSubject, map, Observable, combineLatest } from "rxjs";
import { first } from "lodash";

import { vec2Distance, Vector2 } from "@/vector2";

import { MAP_EXTENT_RADIUS } from "@/game-settings";

import { PlotBuilder } from "@/services/plotter/builder/PlotBuilder";
import { PlotBuilderItem } from "@/services/plotter/builder/PlotBuilderItem";
import { PlotItem, PlotPoint, PlotResult } from "@/services/plotter/types";
import { MapEntity } from "@/services/potion-maps/types";
import { PotionMap } from "@/services/potion-maps/PotionMap";

import { IPlotViewModel } from "@/components/Plot/PlotViewModel";
import { IPanZoomViewportViewModel } from "@/components/PanZoomViewport/PanZoomViewportViewModel";
import { CoordinateMappingViewportViewModel } from "@/components/PanZoomViewport/CoordinateMappingViewportViewModel";

export interface IPlotBuilderViewModel
  extends IPanZoomViewportViewModel,
    IPlotViewModel {
  get map$(): Observable<PotionMap | null>;
  get plot$(): Observable<Readonly<PlotResult> | null>;
  get mouseOverPlotItem$(): Observable<PlotItem | null>;
  get mouseOverBuilderItem$(): Observable<PlotBuilderItem | null>;
  get mouseOverEntity$(): Observable<MapEntity | null>;
  get mouseOverPlotPoint(): Observable<PlotPoint | null>;
  get mouseWorldPosition$(): Observable<Vector2 | null>;

  onMouseOverPlotItem(item: PlotItem | null): void;
  onMouseOverBuilderItem(item: PlotBuilderItem | null): void;
}

export class PlotBuilderViewModel
  extends CoordinateMappingViewportViewModel
  implements IPlotBuilderViewModel, IPlotViewModel, IPanZoomViewportViewModel
{
  private readonly _mouseOverPlotItem$ = new BehaviorSubject<PlotItem | null>(
    null
  );
  private readonly _mouseOverBuilderItem$ =
    new BehaviorSubject<PlotBuilderItem | null>(null);
  private readonly _mouseOverEntity$: Observable<MapEntity | null>;

  private readonly _mouseOverPlotPoint$: Observable<PlotPoint | null>;

  constructor(private readonly _builder: PlotBuilder) {
    super(
      { width: MAP_EXTENT_RADIUS * 2, height: MAP_EXTENT_RADIUS * 2 },
      { x: MAP_EXTENT_RADIUS, y: MAP_EXTENT_RADIUS },
      { x: 1, y: -1 }
    );

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

  get map$(): Observable<PotionMap | null> {
    return this._builder.map$;
  }

  get plot$(): Observable<Readonly<PlotResult> | null> {
    return this._builder.plot$;
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
