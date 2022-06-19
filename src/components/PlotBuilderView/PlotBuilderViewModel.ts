import { BehaviorSubject, map, Observable, combineLatest } from "rxjs";
import { inject } from "microinject";
import { first } from "lodash";

import { vec2Distance, Vector2 } from "@/vector2";
import { Size } from "@/size";
import { isNotNull } from "@/utils";

import { MAP_EXTENT_RADIUS } from "@/game-settings";

import { PlotItem, PlotPoint, PlotResult } from "@/services/plotter/types";
import { MapEntity } from "@/services/potion-maps/types";
import { PotionMap } from "@/services/potion-maps/PotionMap";
import { Plotter } from "@/services/plotter/Plotter";

import { IPlotViewModel } from "@/components/Plot/PlotViewModel";

import { IPanZoomViewportViewModel } from "@/components/PanZoomViewport/PanZoomViewportViewModel";
import { CoordinateMappingViewportViewModel } from "@/components/PanZoomViewport/CoordinateMappingViewportViewModel";

import { PlotBuilderItem } from "./builder/PlotBuilderItem";
import { PlotBuilderItemCollection } from "./builder";

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

  get plotBuilderItems$(): Observable<readonly PlotBuilderItem[]>;

  movePlotBuilderItem(item: PlotBuilderItem, newIndex: number): void;
  addPlotBuilderItem(itemType: PlotItem["type"]): void;

  onMouseOverPlotItem(item: PlotItem | null): void;
  onMouseOverBuilderItem(item: PlotBuilderItem | null): void;
}

export class PlotBuilderViewModel
  implements IPlotBuilderViewModel, IPlotViewModel, IPanZoomViewportViewModel
{
  private readonly _viewportViewModel: CoordinateMappingViewportViewModel;

  private readonly _mouseOverPlotItem$ = new BehaviorSubject<PlotItem | null>(
    null
  );
  private readonly _mouseOverBuilderItem$ =
    new BehaviorSubject<PlotBuilderItem | null>(null);
  private readonly _mouseOverEntity$: Observable<MapEntity | null>;

  private readonly _mouseOverPlotPoint$: Observable<PlotPoint | null>;

  private readonly _plotBuilderItems: PlotBuilderItemCollection;

  private readonly _map$ = new BehaviorSubject<PotionMap | null>(null);
  private readonly _plot$: Observable<Readonly<PlotResult> | null>;

  constructor(@inject(Plotter) plotter: Plotter) {
    this._viewportViewModel = new CoordinateMappingViewportViewModel(
      { width: MAP_EXTENT_RADIUS * 2, height: MAP_EXTENT_RADIUS * 2 },
      { x: MAP_EXTENT_RADIUS, y: MAP_EXTENT_RADIUS },
      { x: 1, y: -1 }
    );

    this._plotBuilderItems = new PlotBuilderItemCollection();

    this._plot$ = combineLatest([
      this._map$,
      this._plotBuilderItems.plotItems$,
    ]).pipe(
      map(([map, plotItems]) => {
        if (map == null) {
          return null;
        }
        return plotter.plotItems(plotItems.filter(isNotNull), map);
      })
    );

    this._mouseOverEntity$ = combineLatest([
      this._viewportViewModel.mouseWorldPosition$,
      this._map$,
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
      this._viewportViewModel.mouseWorldPosition$,
      this._mouseOverPlotItem$,
      this._plot$,
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

  get viewportSize$(): Observable<Size> {
    return this._viewportViewModel.viewportSize$;
  }

  get viewOffset$(): Observable<Vector2> {
    return this._viewportViewModel.viewOffset$;
  }

  get viewScale$(): Observable<number> {
    return this._viewportViewModel.viewScale$;
  }

  get mouseWorldPosition$(): Observable<Vector2 | null> {
    return this._viewportViewModel.mouseWorldPosition$;
  }

  get map$(): Observable<PotionMap | null> {
    return this._map$;
  }

  get plotBuilderItems$(): Observable<readonly PlotBuilderItem[]> {
    return this._plotBuilderItems.plotBuilderItems$;
  }

  get plotItems$(): Observable<readonly PlotItem[]> {
    return this._plotBuilderItems.plotItems$;
  }

  get plot$(): Observable<Readonly<PlotResult> | null> {
    return this._plot$;
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

  setMap(map: PotionMap) {
    this._map$.next(map);
  }

  zoom(delta: number, on: Vector2 | null | undefined): void {
    this._viewportViewModel.zoom(delta, on);
  }

  setZoom(scale: number): void {
    this._viewportViewModel.setZoom(scale);
  }

  pan(dx: number, dy: number, applyZoom?: boolean | undefined): void {
    this._viewportViewModel.pan(dx, dy, applyZoom);
  }

  clear() {
    this._plotBuilderItems.clear();
  }

  loadPlotItems(items: PlotItem[]) {
    this._plotBuilderItems.loadPlotItems(items);
  }

  movePlotBuilderItem(item: PlotBuilderItem, newIndex: number): void {
    this._plotBuilderItems.moveItem(item, newIndex);
  }

  addPlotBuilderItem(itemType: PlotItem["type"]): void {
    this._plotBuilderItems.addNewItem(itemType);
  }

  onViewportResized(width: number, height: number): void {
    this._viewportViewModel.onViewportResized(width, height);
  }

  onMouseMove(clientX: number, clientY: number): void {
    this._viewportViewModel.onMouseMove(clientX, clientY);
  }

  onMouseOut(): void {
    this._viewportViewModel.onMouseOut();
    this._mouseOverPlotItem$.next(null);
  }

  onMouseOverPlotItem(item: PlotItem | null): void {
    this._mouseOverPlotItem$.next(item);
    this._mouseOverBuilderItem$.next(
      item ? this._plotBuilderItems.builderItemFor(item) : null
    );
  }

  onMouseOverBuilderItem(item: PlotBuilderItem | null): void {
    this._mouseOverBuilderItem$.next(item);
    this._mouseOverPlotItem$.next(item ? item.plotItem : null);
  }
}
