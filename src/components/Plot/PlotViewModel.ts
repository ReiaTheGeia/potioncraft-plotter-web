import React from "react";
import { BehaviorSubject, Observable } from "rxjs";

import { Vector2, vec2Add, vec2Scale, vec2Subtract, Vec2Zero } from "@/points";
import { MAP_EXTENT_RADIUS } from "@/game-settings";
import { PlotItem, PlotPoint } from "@/services/plotter/types";
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
  readonly viewOffset$: Observable<Vector2>;
  readonly viewScale$: Observable<number>;
  readonly mouseOverPlotItem$: Observable<PlotItem | null>;
  readonly bottlePreviewPoint$: Observable<PlotPoint | null>;

  onMouseOverPlotItem(item: PlotItem | null): void;
}
