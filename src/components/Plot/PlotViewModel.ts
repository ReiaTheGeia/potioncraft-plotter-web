import { Observable } from "rxjs";

import { Vector2 } from "@/vector2";
import { Size } from "@/size";

import { PlotItem, PlotPoint } from "@/services/plotter/types";

export interface IPlotViewModel {
  readonly viewportSize$: Observable<Size>;
  readonly viewOffset$: Observable<Vector2>;
  readonly viewScale$: Observable<number>;

  readonly highlightPlotItem$: Observable<PlotItem | null>;
  readonly highlightPlotPoint$: Observable<PlotPoint | null>;

  onMouseOverPlotItem(item: PlotItem | null): void;
}
