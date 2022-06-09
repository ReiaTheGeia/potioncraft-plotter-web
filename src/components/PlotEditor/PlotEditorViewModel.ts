import { BehaviorSubject, map, Observable } from "rxjs";

import { inject } from "microinject";

import {
  Point,
  pointAdd,
  pointScale,
  pointSubtract,
  PointZero,
} from "@/points";

import { MAP_EXTENT_RADIUS } from "@/game-settings";

import { PlotBuilder, PlotBuilderItem } from "@/services/plotter/PlotBuilder";
import { PlotItem } from "@/services/plotter/types";

import { IPlotViewModel } from "../Plot/PlotViewModel";
import { IPanZoomViewportViewModel } from "../PanZoomViewport/PanZoomViewportViewModel";

export class PlotEditorViewModel
  implements IPlotViewModel, IPanZoomViewportViewModel
{
  private readonly _viewOffset$ = new BehaviorSubject<Point>(PointZero);
  private readonly _viewScale$ = new BehaviorSubject<number>(1);
  private readonly _mouseOverBuilderItem$ =
    new BehaviorSubject<PlotBuilderItem | null>(null);
  private readonly _shareString$: Observable<string>;
  private readonly _mouseOverPlotItem$ = new BehaviorSubject<PlotItem | null>(
    null
  );

  private _viewportWidth: number = 0;
  private _viewportHeight: number = 0;

  constructor(@inject(PlotBuilder) private readonly _builder: PlotBuilder) {
    this._shareString$ = this._builder.plot$.pipe(
      map((x) => _builder.getShareString())
    );
  }

  get builder(): PlotBuilder {
    return this._builder;
  }

  get shareString$(): Observable<string> {
    return this._shareString$;
  }

  get viewOffset$(): Observable<Point> {
    return this._viewOffset$;
  }
  get viewScale$(): Observable<number> {
    return this._viewScale$;
  }

  get mouseOverPlotItem$(): Observable<PlotItem | null> {
    return this._mouseOverPlotItem$;
  }

  get mouseOverBuilderItem$(): Observable<PlotBuilderItem | null> {
    return this._mouseOverBuilderItem$;
  }

  zoom(delta: number, on: Point | null = null) {
    const prevWorld = on ? this._clientToWorld(on) : PointZero;
    const pzoom = this._viewScale$.value;
    const zoom = pzoom * delta;
    this._viewScale$.next(zoom);
    if (on) {
      const world = this._clientToWorld(on);
      const delta = pointSubtract(prevWorld, world);
      this._viewOffset$.next(pointAdd(this._viewOffset$.value, delta));
    }
  }

  pan(dx: number, dy: number, applyZoom = false) {
    const z = applyZoom ? 1 / this._viewScale$.value : 1;
    this._viewOffset$.next(
      pointAdd(this._viewOffset$.value, { x: dx * z, y: dy * z })
    );
  }

  onViewportResized(width: number, height: number): void {
    this._viewportWidth = width;
    this._viewportHeight = height;
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

  private _clientToWorld(client: Point): Point {
    const offset = this._viewOffset$.value;
    const scale = this._viewScale$.value;

    client = pointScale(client, 1 / scale);
    client = pointScale(client, (MAP_EXTENT_RADIUS * 2) / this._viewportWidth);
    client = pointAdd(client, offset);
    client = {
      x: client.x - MAP_EXTENT_RADIUS,
      y: client.y - MAP_EXTENT_RADIUS,
    };

    return client;
  }
}
