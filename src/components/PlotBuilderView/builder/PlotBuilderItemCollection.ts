import { BehaviorSubject, Observable, debounceTime, map } from "rxjs";

import { isNotNull } from "@/utils";
import { observeAll } from "@/observables";

import {
  AddIngredientPlotItem,
  HeatVortexPlotItem,
  PlotItem,
  PourSolventPlotItem,
  SetPositionPlotItem,
  StirCauldronPlotItem,
  AddVoidSaltPlotItem,
} from "@/services/plotter/types";

import { PlotBuilderItem } from "./PlotBuilderItem";

import { AddIngredientPlotBuilderItem } from "./AddIngredientPlotBuilderItem";
import { HeatVortexPlotBuilderItem } from "./HeatVortexPlotBuilderItem";
import { PourSolventPlotBuilderItem } from "./PourSolventPlotBuilderItem";
import { StirCauldronPlotBuilderItem } from "./StirCauldronPlotBuilderItem";
import { AddVoidSaltPlotBuilderItem } from "./AddVoidSaltPlotBuilderItem";
import { SetPositionPlotBuilderItem } from "./SetPositionPlotBuilderItem";

export interface IPlotBuilderItemCollection {
  readonly items$: Observable<readonly PlotBuilderItem[]>;

  builderItemFor(item: PlotItem): PlotBuilderItem | null;

  moveItem(item: PlotBuilderItem, index: number): void;

  addPlotItem(item: PlotItem): void;
  addPlotItem(itemType: PlotItem["type"]): void;
}

export class PlotBuilderItemCollection extends Observable<
  readonly PlotBuilderItem[]
> {
  private readonly _items$ = new BehaviorSubject<readonly PlotBuilderItem[]>(
    []
  );

  private readonly _plotItems$ = new BehaviorSubject<readonly PlotItem[]>([]);

  constructor() {
    super((observer) => this._items$.subscribe(observer));

    this.plotBuilderItems$
      .pipe(map((item) => item.map((x) => x.plotItem$)))
      .pipe(observeAll())
      // Add a small debounce so we dont re-plot rapidly while loading items or making changes.
      .pipe(debounceTime(10))
      .subscribe((items) => {
        this._plotItems$.next(items.filter(isNotNull));
      });
  }

  get plotBuilderItems$(): Observable<readonly PlotBuilderItem[]> {
    return this._items$;
  }

  get plotItems$(): Observable<readonly PlotItem[]> {
    return this._plotItems$;
  }

  clear(): void {
    this._items$.next([]);
  }

  loadPlotItems(items: PlotItem[]) {
    for (const item of items) {
      let value = item as any;
      if (value.type === "set-position" && value.position) {
        value = {
          ...item,
          x: value.position.x,
          y: value.position.y,
        };
      }
      this.addPlotItem(value);
    }
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

  addPlotItem(plotItem: PlotItem): void;
  addPlotItem(itemType: PlotItem["type"]): void;
  addPlotItem(item: PlotItem | PlotItem["type"]) {
    const itemType = typeof item === "string" ? item : item.type;
    const itemBase = typeof item === "string" ? undefined : item;
    switch (itemType) {
      case "set-position":
        this._addSetPosition(itemBase as any);
        break;
      case "add-ingredient":
        this._addIngredient(itemBase as any);
        break;
      case "stir-cauldron":
        this._addStirCauldron(itemBase as any);
        break;
      case "pour-solvent":
        this._addPourSolvent(itemBase as any);
        break;
      case "heat-vortex":
        this._addHeatVortex(itemBase as any);
        break;
      case "void-salt":
        this._addVoidSalt(itemBase as any);
        break;
      default:
        throw new Error(`Unknown plot item type: ${itemType}`);
    }
  }

  builderItemFor(item: PlotItem): PlotBuilderItem | null {
    const result = this._items$.value.find((x) => x.plotItem === item) || null;
    return result;
  }

  private _addSetPosition(
    plotItem?: SetPositionPlotItem
  ): SetPositionPlotBuilderItem {
    const item = new SetPositionPlotBuilderItem((item) =>
      this._deleteItem(item)
    );
    if (plotItem) {
      item.setX(plotItem.x);
      item.setY(plotItem.y);
    }
    this._items$.next([...this._items$.value, item]);
    return item;
  }

  private _addIngredient(
    plotItem?: AddIngredientPlotItem
  ): AddIngredientPlotBuilderItem {
    const item = new AddIngredientPlotBuilderItem((item) =>
      this._deleteItem(item)
    );
    if (plotItem) {
      item.setIngredientId(plotItem.ingredientId);
      item.setGrindPercent(plotItem.grindPercent);
    }
    this._items$.next([...this._items$.value, item]);
    return item;
  }

  private _addStirCauldron(
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

  private _addPourSolvent(
    plotItem?: PourSolventPlotItem
  ): PourSolventPlotBuilderItem {
    const item = new PourSolventPlotBuilderItem((item) =>
      this._deleteItem(item)
    );
    if (plotItem) {
      item.setDistance(plotItem.distance);
    }
    this._items$.next([...this._items$.value, item]);
    return item;
  }

  private _addHeatVortex(
    plotItem?: HeatVortexPlotItem
  ): HeatVortexPlotBuilderItem {
    const item = new HeatVortexPlotBuilderItem((item) =>
      this._deleteItem(item)
    );
    if (plotItem) {
      item.setDistance(plotItem.distance);
    }
    this._items$.next([...this._items$.value, item]);
    return item;
  }

  private _addVoidSalt(
    plotItem?: AddVoidSaltPlotItem
  ): AddVoidSaltPlotBuilderItem {
    const item = new AddVoidSaltPlotBuilderItem((item) =>
      this._deleteItem(item)
    );
    if (plotItem) {
      item.setGrains(plotItem.grains);
    }
    this._items$.next([...this._items$.value, item]);
    return item;
  }

  private _deleteItem(item: PlotBuilderItem) {
    this._items$.next(this._items$.value.filter((x) => x !== item));
  }
}
