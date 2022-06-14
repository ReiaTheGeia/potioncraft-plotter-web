import { Observable } from "rxjs";

import { Vector2 } from "@/points";

export interface IPanZoomViewportViewModel {
  readonly viewOffset$: Observable<Vector2>;
  readonly viewScale$: Observable<number>;

  zoom(delta: number, on: Vector2 | null | undefined): void;
  pan(dx: number, dy: number, applyZoom?: boolean): void;

  onViewportResized(width: number, height: number): void;
  onMouseMove(clientX: number, clientY: number): void;
  onMouseOut(): void;
}
