import { Vector2 } from "@/vector2";

export interface IPanZoomViewportViewModel {
  zoom(delta: number, on: Vector2 | null | undefined): void;
  pan(dx: number, dy: number, applyZoom?: boolean): void;

  onViewportResized(width: number, height: number): void;
  onMouseMove(clientX: number, clientY: number): void;
  onMouseOut(): void;
}
