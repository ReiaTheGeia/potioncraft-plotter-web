import { BehaviorSubject, Observable } from "rxjs";
import {
  AddIngredientPlotItem,
  HeatVortexPlotItem,
  PlotItem,
  PourSolventPlotItem,
  StirCauldronPlotItem,
} from "../types";

import { PlotBuilderItem } from "./PlotBuilderItem";

import { AddIngredientPlotBuilderItem } from "./AddIngredientPlotBuilderItem";
import { HeatVortexPlotBuilderItem } from "./HeatVortexPlotBuilderItem";
import { PourSolventPlotBuilderItem } from "./PourSolventPlotBuilderItem";
import { StirCauldronPlotBuilderItem } from "./StirCauldronPlotBuilderItem";

export interface IPlotBuilderItemCollection {
  readonly items$: Observable<readonly PlotBuilderItem[]>;

  builderItemFor(item: PlotItem): PlotBuilderItem | null;

  moveItem(item: PlotBuilderItem, index: number): void;

  addIngredient(plotItem?: AddIngredientPlotItem): AddIngredientPlotBuilderItem;
  addStirCauldron(plotItem?: StirCauldronPlotItem): StirCauldronPlotBuilderItem;
  addPourSolvent(plotItem?: PourSolventPlotItem): PourSolventPlotBuilderItem;
  addHeatVortex(plotItem?: HeatVortexPlotItem): HeatVortexPlotBuilderItem;
}

export class PlotBuilderItemCollection extends Observable<
  readonly PlotBuilderItem[]
> {
  private readonly _items$ = new BehaviorSubject<readonly PlotBuilderItem[]>(
    []
  );

  constructor() {
    super((observer) => this._items$.subscribe(observer));
  }

  get items$(): Observable<readonly PlotBuilderItem[]> {
    return this._items$;
  }

  get items(): readonly PlotBuilderItem[] {
    return this._items$.value;
  }

  clear(): void {
    this._items$.next([]);
  }

  moveItem(item: PlotBuilderItem, index: number) {
    if (index < 0 || index > this._items$.value.length) {
      return;
    }

    const sourceIndex = this._items$.value.indexOf(item);
    if (sourceIndex === -1) {
      return;
    }

    const items = [...this._items$.value];
    items.splice(sourceIndex, 1);
    if (sourceIndex < index) {
      index--;
    }
    items.splice(index, 0, item);
    this._items$.next(items);
  }

  addIngredient(
    plotItem?: AddIngredientPlotItem
  ): AddIngredientPlotBuilderItem {
    const item = new AddIngredientPlotBuilderItem((item) =>
      this._deleteItem(item)
    );
    if (plotItem) {
      item.setIngredient(plotItem.ingredientId);
      item.setGrindPercent(plotItem.grindPercent);
    }
    this._items$.next([...this._items$.value, item]);
    return item;
  }

  addStirCauldron(
    plotItem?: StirCauldronPlotItem
  ): StirCauldronPlotBuilderItem {
    const item = new StirCauldronPlotBuilderItem((item) =>
      this._deleteItem(item)
    );
    if (plotItem) {
      item.setDistance(plotItem.distance);
    }
    this._items$.next([...this._items$.value, item]);
    return item;
  }

  addPourSolvent(plotItem?: PourSolventPlotItem): PourSolventPlotBuilderItem {
    const item = new PourSolventPlotBuilderItem((item) =>
      this._deleteItem(item)
    );
    if (plotItem) {
      item.setDistance(plotItem.distance);
    }
    this._items$.next([...this._items$.value, item]);
    return item;
  }

  addHeatVortex(plotItem?: PourSolventPlotItem): HeatVortexPlotBuilderItem {
    const item = new HeatVortexPlotBuilderItem((item) =>
      this._deleteItem(item)
    );
    if (plotItem) {
      item.setDistance(plotItem.distance);
    }
    this._items$.next([...this._items$.value, item]);
    return item;
  }

  builderItemFor(item: PlotItem): PlotBuilderItem | null {
    const result = this._items$.value.find((x) => x.plotItem === item) || null;
    return result;
  }

  private _deleteItem(item: PlotBuilderItem) {
    this._items$.next(this._items$.value.filter((x) => x !== item));
  }
}
