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

export const PlotViewModelContext = React.createContext<PlotViewModel | null>(
  null
);

export function usePlotViewModel(): PlotViewModel {
  const plotViewModel = React.useContext(PlotViewModelContext);
  if (!plotViewModel) {
    throw new Error("PlotViewModelContext not found");
  }
  return plotViewModel;
}

export class PlotViewModel {
  private readonly _viewOffset$ = new BehaviorSubject<Point>(PointZero);
  private readonly _viewScale$ = new BehaviorSubject<number>(1);

  private _viewportWidth: number = 0;
  private _viewportHeight: number = 0;

  get viewOffset$(): Observable<Point> {
    return this._viewOffset$;
  }

  get viewScale$(): Observable<number> {
    return this._viewScale$;
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
      // FIXME: This should remain stationary if the mouse is in the center of the viewport, but instead it only remains stationary for mouse
      // in the top left corner.
      const world = this._clientToWorld(on);
      const delta = pointSubtract(world, prevWorld);
      console.log("Mouse moved from", prevWorld, "to", world);
      this._viewOffset$.next(pointAdd(this._viewOffset$.value, delta));
    }
    // console.log("At zoom level", zoom);
    // console.log("top left", this._clientToWorld({ x: 0, y: 0 }));
    // console.log(
    //   "center",
    //   this._clientToWorld({
    //     x: this._viewportWidth / 2,
    //     y: this._viewportHeight / 2,
    //   })
    // );
    // console.log(
    //   "bottom right",
    //   this._clientToWorld({ x: this._viewportWidth, y: this._viewportHeight })
    // );
  }

  pan(dx: number, dy: number, applyZoom = false) {
    const z = applyZoom ? 1 / this._viewScale$.value : 1;
    this._viewOffset$.next(
      pointAdd(this._viewOffset$.value, { x: dx * z, y: dy * z })
    );
    // console.log("Offset", this._viewOffset$.value);
    // console.log("top left", this._clientToWorld({ x: 0, y: 0 }));
    // console.log(
    //   "center",
    //   this._clientToWorld({
    //     x: this._viewportWidth / 2,
    //     y: this._viewportHeight / 2,
    //   })
    // );
    // console.log(
    //   "bottom right",
    //   this._clientToWorld({ x: this._viewportWidth, y: this._viewportHeight })
    // );
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
