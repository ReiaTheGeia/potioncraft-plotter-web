import {
  BehaviorSubject,
  combineLatest,
  Observable,
  Subscription,
  debounceTime,
} from "rxjs";

import { isNotNull } from "@/utils";

import {
  AddIngredientPlotItem,
  HeatVortexPlotItem,
  PlotItem,
  PourSolventPlotItem,
  SetPositionPlotItem,
  StirCauldronPlotItem,
  VoidSaltPlotItem,
} from "../../../services/plotter/types";

import { PlotBuilderItem } from "./PlotBuilderItem";

import { AddIngredientPlotBuilderItem } from "./AddIngredientPlotBuilderItem";
import { HeatVortexPlotBuilderItem } from "./HeatVortexPlotBuilderItem";
import { PourSolventPlotBuilderItem } from "./PourSolventPlotBuilderItem";
import { StirCauldronPlotBuilderItem } from "./StirCauldronPlotBuilderItem";
import { VoidSaltPlotBuilderItem } from "./VoidSaltPlotBuilderItem";
import { SetPositionPlotBuilderItem } from "./SetPositionPlotBuilderItem";

export interface IPlotBuilderItemCollection {
  readonly items$: Observable<readonly PlotBuilderItem[]>;

  builderItemFor(item: PlotItem): PlotBuilderItem | null;

  moveItem(item: PlotBuilderItem, index: number): void;

  addIngredient(plotItem?: AddIngredientPlotItem): AddIngredientPlotBuilderItem;
  addStirCauldron(plotItem?: StirCauldronPlotItem): StirCauldronPlotBuilderItem;
  addPourSolvent(plotItem?: PourSolventPlotItem): PourSolventPlotBuilderItem;
  addHeatVortex(plotItem?: HeatVortexPlotItem): HeatVortexPlotBuilderItem;
  addVoidSalt(plotItem?: VoidSaltPlotItem): VoidSaltPlotBuilderItem;
}

export class PlotBuilderItemCollection extends Observable<
  readonly PlotBuilderItem[]
> {
  private readonly _items$ = new BehaviorSubject<readonly PlotBuilderItem[]>(
    []
  );

  private _itemSubscription: Subscription | null = null;
  private readonly _plotItems$ = new BehaviorSubject<readonly PlotItem[]>([]);

  constructor() {
    super((observer) => this._items$.subscribe(observer));

    // Add a small debounce so we dont re-plot rapidly while loading items.
    this.plotBuilderItems$.subscribe((builderItems) => {
      if (this._itemSubscription) {
        this._itemSubscription.unsubscribe();
      }

      if (builderItems.length === 0) {
        this._plotItems$.next([]);
        return;
      }

      this._itemSubscription = combineLatest(
        builderItems.map((x) => x.plotItem$)
      )
        .pipe(debounceTime(10))
        .subscribe((plotItems) => {
          this._plotItems$.next(plotItems.filter(isNotNull));
        });
    });
  }

  get plotBuilderItems$(): Observable<readonly PlotBuilderItem[]> {
    return this._items$;
  }

  get plotBuilderItems(): readonly PlotBuilderItem[] {
    return this._items$.value;
  }

  get plotItems$(): Observable<readonly PlotItem[]> {
    return this._plotItems$;
  }

  clear(): void {
    this._items$.next([]);
  }

  loadPlotItems(items: PlotItem[]) {
    for (const item of items) {
      switch (item.type) {
        case "set-position":
          this.addSetPosition(item);
          break;
        case "add-ingredient":
          this.addIngredient(item);
          break;
        case "stir-cauldron":
          this.addStirCauldron(item);
          break;
        case "pour-solvent":
          this.addPourSolvent(item);
          break;
        case "heat-vortex":
          this.addHeatVortex(item);
          break;
        case "void-salt":
          this.addVoidSalt(item);
          break;
        default:
          throw new Error(`Unknown item type: ${(item as any).type}`);
      }
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

  addSetPosition(plotItem?: SetPositionPlotItem): SetPositionPlotBuilderItem {
    const item = new SetPositionPlotBuilderItem((item) =>
      this._deleteItem(item)
    );
    if (plotItem) {
      item.setX(plotItem.position.x);
      item.setY(plotItem.position.y);
    }
    this._items$.next([...this._items$.value, item]);
    return item;
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

  addHeatVortex(plotItem?: HeatVortexPlotItem): HeatVortexPlotBuilderItem {
    const item = new HeatVortexPlotBuilderItem((item) =>
      this._deleteItem(item)
    );
    if (plotItem) {
      item.setDistance(plotItem.distance);
    }
    this._items$.next([...this._items$.value, item]);
    return item;
  }

  addVoidSalt(plotItem?: VoidSaltPlotItem): VoidSaltPlotBuilderItem {
    const item = new VoidSaltPlotBuilderItem((item) => this._deleteItem(item));
    if (plotItem) {
      item.setGrains(plotItem.grains);
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
