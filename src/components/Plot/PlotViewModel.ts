import React from "react";
import { BehaviorSubject, Observable } from "rxjs";

import {
  Point,
  pointAdd,
  pointScale,
  pointSubtract,
  PointZero,
} from "@/points";
import { MAP_EXTENT_RADIUS } from "@/game-settings";
import { PlotItem } from "@/services/plotter/types";

export const PlotViewModelContext = React.createContext<IPlotViewModel | null>(
  null
);

export function usePlotViewModel(): IPlotViewModel {
  const plotViewModel = React.useContext(PlotViewModelContext);
  if (!plotViewModel) {
    throw new Error("PlotViewModelContext not found");
  }
  return plotViewModel;
}

export interface IPlotViewModel {
  readonly viewOffset$: Observable<Point>;
  readonly viewScale$: Observable<number>;
  readonly mouseOverItem$: Observable<PlotItem | null>;

  viewportResize(width: number, height: number): void;
  zoom(delta: number, on: Point | null | undefined): void;
  pan(dx: number, dy: number, applyZoom?: boolean): void;

  onMouseOverPlotItem(item: PlotItem | null): void;
}

export class PlotViewModel implements IPlotViewModel {
  private readonly _viewOffset$ = new BehaviorSubject<Point>(PointZero);
  private readonly _viewScale$ = new BehaviorSubject<number>(1);
  private readonly _inspectSource = new BehaviorSubject<PlotItem | null>(null);

  private _viewportWidth: number = 0;
  private _viewportHeight: number = 0;

  get viewOffset$(): Observable<Point> {
    return this._viewOffset$;
  }

  get viewScale$(): Observable<number> {
    return this._viewScale$;
  }

  get mouseOverItem$(): Observable<PlotItem | null> {
    return this._inspectSource;
  }

  viewportResize(width: number, height: number) {
    this._viewportWidth = width;
    this._viewportHeight = height;
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

  onMouseOverPlotItem(source: PlotItem | null): void {
    this._inspectSource.next(source);
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
