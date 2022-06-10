import { BehaviorSubject, map, Observable, combineLatest } from "rxjs";

import { inject } from "microinject";

import {
  Point,
  pointAdd,
  pointScale,
  pointSubtract,
  PointZero,
} from "@/points";
import { Size } from "@/size";

import { MAP_EXTENT_RADIUS } from "@/game-settings";

import { PlotBuilder, PlotBuilderItem } from "@/services/plotter/PlotBuilder";
import { PlotItem } from "@/services/plotter/types";

import { IPlotViewModel } from "../Plot/PlotViewModel";
import { IPanZoomViewportViewModel } from "../PanZoomViewport/PanZoomViewportViewModel";

export class PlotEditorViewModel
  implements IPlotViewModel, IPanZoomViewportViewModel
{
  private readonly _viewportSize$ = new BehaviorSubject<Size>({
    width: MAP_EXTENT_RADIUS * 2,
    height: MAP_EXTENT_RADIUS * 2,
  });

  /**
   * The offset of the map on the viewport, in map units, unscaled.
   */
  private readonly _viewOffset$ = new BehaviorSubject<Point>(PointZero);
  private readonly _viewScale$ = new BehaviorSubject<number>(1);
  private readonly _mouseOverBuilderItem$ =
    new BehaviorSubject<PlotBuilderItem | null>(null);
  private readonly _shareString$: Observable<string>;
  private readonly _mouseClientPosition$ = new BehaviorSubject<Point>(
    PointZero
  );
  private readonly _mouseWorldPosition$: Observable<Point>;
  private readonly _mouseOverPlotItem$ = new BehaviorSubject<PlotItem | null>(
    null
  );

  constructor(@inject(PlotBuilder) private readonly _builder: PlotBuilder) {
    this._shareString$ = this._builder.plot$.pipe(
      map((x) => _builder.getShareString())
    );
    this._mouseWorldPosition$ = combineLatest([
      this._mouseClientPosition$,
      this._viewOffset$,
      this._viewScale$,
    ]).pipe(map(([clientPos]) => this._clientToWorld(clientPos)));
  }

  get builder(): PlotBuilder {
    return this._builder;
  }

  get shareString$(): Observable<string> {
    return this._shareString$;
  }

  get viewportSize$(): Observable<Size> {
    return this._viewportSize$;
  }

  get viewOffset$(): Observable<Point> {
    return this._viewOffset$;
  }
  get viewScale$(): Observable<number> {
    return this._viewScale$;
  }

  get mouseWorldPosition$(): Observable<Point> {
    return this._mouseWorldPosition$;
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
      const delta = pointSubtract(world, prevWorld);
      this._viewOffset$.next(pointAdd(this._viewOffset$.value, delta));
    }
  }

  pan(dx: number, dy: number, applyZoom = false) {
    const z = applyZoom ? 1 / this._viewScale$.value : 1;
    this._viewOffset$.next(
      pointAdd(this._viewOffset$.value, { x: dx * z, y: dy * z })
    );
  }

  onMouseMove(clientX: number, clientY: number): void {
    this._mouseClientPosition$.next({ x: clientX, y: clientY });
  }

  onViewportResized(width: number, height: number): void {
    const prevSize = this._viewportSize$.value;
    this._viewportSize$.next({ width, height });
    // FIXME: zoom in or out to fit the new size
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

  private _clientToWorld(p: Point): Point {
    const zoomFactor = this._viewScale$.value;
    const { x: offsetX, y: offsetY } = this._viewOffset$.value;

    // Why the hell is offset operating in the opposite direction of crucible-web even with the same map renderer?

    // return {
    //   x: p.x / zoomFactor - MAP_EXTENT_RADIUS + offsetX,
    //   y: (p.y / zoomFactor - MAP_EXTENT_RADIUS + offsetY) * -1,
    // };

    return {
      x: p.x / zoomFactor - MAP_EXTENT_RADIUS - offsetX,
      y: (p.y / zoomFactor - MAP_EXTENT_RADIUS - offsetY) * -1,
    };
  }

  private _worldToClient(p: Point): Point {
    const zoomFactor = this._viewScale$.value;
    const { x: offsetX, y: offsetY } = this._viewOffset$.value;

    // Why the hell is this opposite of crucible-web even with the same client to world coord function?
    return {
      x: (p.x + MAP_EXTENT_RADIUS + offsetX) * zoomFactor,
      y: (-p.y + MAP_EXTENT_RADIUS + offsetY) * zoomFactor,
    };
  }
}
