import { BehaviorSubject, combineLatest, map, Observable } from "rxjs";

import { Size, SizeZero } from "@/size";
import { vec2Add, vec2Subtract, Vec2Zero, Vector2 } from "@/vector2";

import { IPanZoomViewportViewModel } from "./PanZoomViewportViewModel";

export class CoordinateMappingViewportViewModel
  implements IPanZoomViewportViewModel
{
  private readonly _viewportSize$ = new BehaviorSubject<Size>(SizeZero);

  /**
   * The offset of the map on the viewport, in map units, unscaled.
   */
  private readonly _viewOffset$ = new BehaviorSubject<Vector2>(Vec2Zero);
  private readonly _viewScale$ = new BehaviorSubject<number>(1);

  private readonly _mouseClientPosition$ = new BehaviorSubject<Vector2 | null>(
    null
  );
  private readonly _mouseWorldPosition$: Observable<Vector2 | null>;

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

  constructor(
    private readonly _initialSize: Size,
    private readonly _originOffset: Vector2,
    private readonly _unitScale: Vector2
  ) {
    this._viewportSize$.next(_initialSize);
    this._mouseWorldPosition$ = combineLatest([
      this._mouseClientPosition$,
      this._viewOffset$,
      this._viewScale$,
    ]).pipe(
      map(([clientPos]) => (clientPos ? this.clientToWorld(clientPos) : null))
    );
  }

  zoom(delta: number, on: Vector2 | null = null) {
    const prevWorld = on ? this.clientToWorld(on) : Vec2Zero;
    const pzoom = this._viewScale$.value;
    const zoom = pzoom * delta;
    this._viewScale$.next(zoom);
    if (on) {
      const world = this.clientToWorld(on);
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
      prevSize = this._initialSize;
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

  clientToWorld(p: Vector2): Vector2 {
    const zoomFactor = this._viewScale$.value;
    const { x: offsetX, y: offsetY } = this._viewOffset$.value;

    // offset is in world coords.
    // We need to add offsetY instead of subtract as y is flipped in world coords when compared to screen.
    return {
      x:
        (p.x / zoomFactor - this._originOffset.x - offsetX) * this._unitScale.x,
      y:
        (p.y / zoomFactor - this._originOffset.y + offsetY) * this._unitScale.y,
    };
  }

  worldToClient(p: Vector2): Vector2 {
    const zoomFactor = this._viewScale$.value;
    const { x: offsetX, y: offsetY } = this._viewOffset$.value;

    // Why the hell is this opposite of crucible-web even with the same client to world coord function?
    return {
      x:
        (this._unitScale.x / p.x + this._originOffset.x + offsetX) * zoomFactor,
      y:
        (this._unitScale.y / p.y + this._originOffset.y + offsetY) * zoomFactor,
    };
  }
}
