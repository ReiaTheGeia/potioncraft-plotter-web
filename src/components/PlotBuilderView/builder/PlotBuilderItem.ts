import { Observable, BehaviorSubject, combineLatest } from "rxjs";

import {
  DefaultPlotItemByType,
  PlotItem,
  PlotItemKeysByType,
  PlotItemValidatorByType,
} from "@/services/plotter/types";

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
    itemPropObservables[key] = new BehaviorSubject<any>(
      (DefaultPlotItemByType[type] as any)[key]
    );
    builderItem[`set${key[0].toUpperCase() + key.substring(1)}`] = (
      value: any
    ) => itemPropObservables[key].next(value);

    builderItem[`${key}$`] = itemPropObservables[key];
  }

  const plotItem$ = new BehaviorSubject<PlotItem | null>(null);
  const isValid$ = new BehaviorSubject<boolean>(false);
  combineLatest(keys.map((key) => itemPropObservables[key])).subscribe(
    (values) => {
      const item = { type } as any;
      for (let i = 0; i < keys.length; i++) {
        if (values[i] === null) {
          isValid$.next(false);
          plotItem$.next(null);
          return;
        }
        item[keys[i]] = values[i];
      }
      if (!PlotItemValidatorByType[type](item)) {
        plotItem$.next(null);
        isValid$.next(false);
      } else {
        plotItem$.next(item);
        isValid$.next(true);
      }
    }
  );

  Object.defineProperty(builderItem, "type", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: type,
  });

  Object.defineProperty(builderItem, "isValid", {
    configurable: false,
    enumerable: true,
    get: () => isValid$.value,
  });
  builderItem["isValid$"] = isValid$;

  builderItem.plotItem$ = plotItem$;
  Object.defineProperty(builderItem, "plotItem", {
    enumerable: true,
    configurable: false,
    get: () => plotItem$.value,
  });

  builderItem.delete = () => deleter(builderItem);

  return builderItem;
}
