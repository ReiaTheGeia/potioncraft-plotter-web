import { Observable } from "rxjs";
import { PlotItem } from "../../../services/plotter/types";

export interface PlotBuilderItemBase {
  readonly type: PlotItem["type"];

  readonly isValid$: Observable<boolean>;
  readonly isValid: boolean;

  readonly plotItem$: Observable<PlotItem | null>;
  readonly plotItem: PlotItem | null;

  delete(): void;
}

type PlotBuilderItemObservables<TPlotItem extends PlotItem> = {
  [K in keyof Omit<TPlotItem, "type"> as `${string & K}$`]: Observable<
    TPlotItem[K] | null
  >;
};
type PlotBuilderItemSetters<TPlotItem extends PlotItem> = {
  [K in keyof Omit<TPlotItem, "type"> as `set${Capitalize<string & K>}`]: void;
};

export type PlotBuilderItem<TPlotItem extends PlotItem> = {
  type: TPlotItem["type"];
} & PlotBuilderItemBase &
  PlotBuilderItemObservables<TPlotItem> &
  PlotBuilderItemSetters<TPlotItem>;
