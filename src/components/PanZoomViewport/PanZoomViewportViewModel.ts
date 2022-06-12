import { Observable } from "rxjs";

import { Point } from "@/points";

export interface IPanZoomViewportViewModel {
  readonly viewOffset$: Observable<Point>;
  readonly viewScale$: Observable<number>;

  zoom(delta: number, on: Point | null | undefined): void;
  pan(dx: number, dy: number, applyZoom?: boolean): void;

  onViewportResized(width: number, height: number): void;
  onMouseMove(clientX: number, clientY: number): void;
  onMouseOut(): void;
}
