import {
  BehaviorSubject,
  map,
  Observable,
  combineLatest,
  debounceTime,
} from "rxjs";
import { first } from "lodash";

import { inject } from "microinject";

import {
  Vector2,
  vec2Add,
  vec2Distance,
  vec2Subtract,
  Vec2Zero,
} from "@/vector2";
import { Size, SizeZero } from "@/size";

import { MAP_EXTENT_RADIUS } from "@/game-settings";

import { PlotBuilder, PlotBuilderItem } from "@/services/plotter/PlotBuilder";
import { PlotItem, PlotPoint } from "@/services/plotter/types";
import { MapEntity } from "@/services/potion-maps/types";

import { IPlotViewModel } from "@/components/Plot/PlotViewModel";
import { IPanZoomViewportViewModel } from "@/components/PanZoomViewport/PanZoomViewportViewModel";

export class PlotterPageViewModel
  implements IPlotViewModel, IPanZoomViewportViewModel
{
  private readonly _viewportSize$ = new BehaviorSubject<Size>(SizeZero);

  /**
   * The offset of the map on the viewport, in map units, unscaled.
   */
  private readonly _viewOffset$ = new BehaviorSubject<Vector2>(Vec2Zero);
  private readonly _viewScale$ = new BehaviorSubject<number>(1);

  private readonly _shareString$: Observable<string>;

  private readonly _mouseClientPosition$ = new BehaviorSubject<Vector2 | null>(
    null
  );
  private readonly _mouseWorldPosition$: Observable<Vector2 | null>;
  private readonly _mouseOverPlotItem$ = new BehaviorSubject<PlotItem | null>(
    null
  );
  private readonly _mouseOverBuilderItem$ =
    new BehaviorSubject<PlotBuilderItem | null>(null);
  private readonly _mouseOverEntity$: Observable<MapEntity | null>;

  private readonly _mouseOverPlotPoint$: Observable<PlotPoint | null>;

  constructor(@inject(PlotBuilder) private readonly _builder: PlotBuilder) {
    this._shareString$ = this._builder.plot$
      .pipe(debounceTime(1000))
      .pipe(map((x) => _builder.getShareString()));

    this._mouseWorldPosition$ = combineLatest([
      this._mouseClientPosition$,
      this._viewOffset$,
      this._viewScale$,
    ]).pipe(
      map(([clientPos]) => (clientPos ? this._clientToWorld(clientPos) : null))
    );

    this._mouseOverEntity$ = combineLatest([
      this._mouseWorldPosition$,
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
      this._mouseWorldPosition$,
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

  get viewportSize$(): Observable<Size> {
    return this._viewportSize$;
  }

  get viewOffset$(): Observable<Vector2> {
    return this._viewOffset$;
  }
  get viewScale$(): Observable<number> {
    return this._viewScale$;
  }

  get mouseWorldPosition$(): Observable<Vector2 | null> {
    return this._mouseWorldPosition$;
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

  zoom(delta: number, on: Vector2 | null = null) {
    const prevWorld = on ? this._clientToWorld(on) : Vec2Zero;
    const pzoom = this._viewScale$.value;
    const zoom = pzoom * delta;
    this._viewScale$.next(zoom);
    if (on) {
      const world = this._clientToWorld(on);
      const delta = vec2Subtract(world, prevWorld);
      this._viewOffset$.next(vec2Add(this._viewOffset$.value, delta));
    }
  }

  setZoom(zoom: number) {
    const delta = zoom / this._viewScale$.value;
    const { width, height } = this._viewportSize$.value;
    this.zoom(delta, { x: width / 2, y: height / 2 });
  }

  pan(dx: number, dy: number, applyZoom = false) {
    const z = applyZoom ? 1 / this._viewScale$.value : 1;
    this._viewOffset$.next(
      vec2Add(this._viewOffset$.value, { x: dx * z, y: dy * z })
    );
  }

  onMouseMove(clientX: number, clientY: number): void {
    this._mouseClientPosition$.next({ x: clientX, y: clientY });
  }

  onMouseOut() {
    this._mouseClientPosition$.next(null);
  }

  onViewportResized(width: number, height: number): void {
    let prevSize = this._viewportSize$.value;
    if (prevSize.width === 0 || prevSize.height === 0) {
      prevSize = {
        width: MAP_EXTENT_RADIUS * 2,
        height: MAP_EXTENT_RADIUS * 2,
      };
    }

    this._viewportSize$.next({ width, height });

    if (width === 0 || height === 0) {
      return;
    }

    let scaleFactor = 1;
    if (width < height) {
      scaleFactor = width / prevSize.width;
    } else {
      scaleFactor = height / prevSize.height;
    }

    // TODO: Keep the view centered.
    // const offset: Point = {
    //   x: (prevSize.width - width) / 2 / this._viewScale$.value,
    //   y: (prevSize.height - height) / 2 / this._viewScale$.value,
    // };
    this._viewScale$.next(this._viewScale$.value * scaleFactor);
    // this._viewOffset$.next(pointAdd(this._viewOffset$.value, offset));
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

  private _clientToWorld(p: Vector2): Vector2 {
    const zoomFactor = this._viewScale$.value;
    const { x: offsetX, y: offsetY } = this._viewOffset$.value;

    // offset is in world coords.
    // We need to add offsetY instead of subtract as y is flipped in world coords when compared to screen.
    return {
      x: p.x / zoomFactor - MAP_EXTENT_RADIUS - offsetX,
      y: (p.y / zoomFactor - MAP_EXTENT_RADIUS + offsetY) * -1,
    };
  }

  private _worldToClient(p: Vector2): Vector2 {
    const zoomFactor = this._viewScale$.value;
    const { x: offsetX, y: offsetY } = this._viewOffset$.value;

    // Why the hell is this opposite of crucible-web even with the same client to world coord function?
    return {
      x: (p.x + MAP_EXTENT_RADIUS + offsetX) * zoomFactor,
      y: (-p.y + MAP_EXTENT_RADIUS + offsetY) * zoomFactor,
    };
  }
}
