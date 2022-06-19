import { Observable } from "rxjs";

import { Vector2 } from "@/vector2";
import { Size } from "@/size";

import { PlotItem, PlotPoint } from "@/services/plotter/types";

export interface IPlotViewModel {
  readonly viewportSize$: Observable<Size>;
  readonly viewOffset$: Observable<Vector2>;
  readonly viewScale$: Observable<number>;
  readonly mouseOverPlotItem$: Observable<PlotItem | null>;

  // This is a little iffy.  This relies on us also being a IPanZoomViewportViewModel to know the mouse position.
  readonly mouseOverPlotPoint: Observable<PlotPoint | null>;

  onMouseOverPlotItem(item: PlotItem | null): void;
}
