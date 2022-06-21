import { capitalize } from "lodash";
import { Observable, BehaviorSubject, combineLatest, map } from "rxjs";

import { PlotItem, PlotItemKeysByType } from "@/services/plotter/types";

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
  [K in keyof Omit<TPlotItem, "type"> as `set${Capitalize<string & K>}`]: (
    value: TPlotItem[K] | null
  ) => void;
};

export type PlotBuilderItem<TPlotItem extends PlotItem = PlotItem> = {
  type: TPlotItem["type"];
} & PlotBuilderItemBase &
  PlotBuilderItemObservables<TPlotItem> &
  PlotBuilderItemSetters<TPlotItem>;

export function createPlotBuilderItem<T extends PlotItem>(
  type: T["type"],
  deleter: (item: PlotBuilderItem) => void
): PlotBuilderItem<T> {
  const keys = PlotItemKeysByType[type];
  const itemPropObservables: Record<string, BehaviorSubject<any>> = {};

  const builderItem = {} as any;
  for (const key of keys) {
    itemPropObservables[key] = new BehaviorSubject<any>(null);
    builderItem[`set${capitalize(key)}`] = (value: any) =>
      itemPropObservables[key].next(value);
    builderItem[`${key}$`] = itemPropObservables[key];
  }

  Object.defineProperty(builderItem, "type", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: type,
  });

  // TODO: isValid
  Object.defineProperty(builderItem, "isValid", {
    value: true,
    configurable: false,
    enumerable: true,
    writable: false,
  });
  builderItem["isValid$"] = new BehaviorSubject(true);

  const plotItem$ = new BehaviorSubject<PlotItem | null>(null);
  combineLatest(keys.map((key) => itemPropObservables[key])).subscribe(
    (values) => {
      const item = { type } as any;
      for (let i = 0; i < keys.length; i++) {
        item[keys[i]] = values[i].value;
      }
      plotItem$.next(item);
    }
  );

  builderItem.plotItem$ = plotItem$;
  Object.defineProperty(builderItem, "plotItem", {
    enumerable: true,
    configurable: false,
    writable: false,
    get: () => plotItem$.value,
  });

  builderItem.delete = () => deleter(builderItem);
  return builderItem;
}
