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
import { Size } from "@/size";

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
  readonly viewportSize$: Observable<Size>;
  readonly viewOffset$: Observable<Point>;
  readonly viewScale$: Observable<number>;
  readonly mouseOverPlotItem$: Observable<PlotItem | null>;

  onMouseOverPlotItem(item: PlotItem | null): void;
}
