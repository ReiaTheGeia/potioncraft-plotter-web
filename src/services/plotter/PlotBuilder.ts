import { isNotNull } from "@/utils";
import { inject, injectable } from "microinject";
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  Subscription,
} from "rxjs";
import pako from "pako";
import {
  encode as encodeBase64,
  decode as decodeBase64,
} from "base64-arraybuffer";

import { IngredientId } from "../ingredients/types";

import { PotionMap } from "../potion-maps/PotionMap";
import { PotionBaseRegistry } from "../potion-bases/PotionBaseRegistry";

import { Plotter } from "./Plotter";
import { PlotItem, PlotResult } from "./types";

@injectable()
export class PlotBuilder {
  private readonly _map$ = new BehaviorSubject<PotionMap | null>(null);
  private readonly _items$ = new BehaviorSubject<readonly PlotBuilderItem[]>(
    []
  );
  private _itemSubscription: Subscription | null = null;
  private readonly _plot$ = new BehaviorSubject<PlotResult | null>(null);

  constructor(
    @inject(PotionBaseRegistry) potionBaseRegistry: PotionBaseRegistry,
    @inject(Plotter) plotter: Plotter
  ) {
    this._map$.next(potionBaseRegistry.getPotionBaseById("water" as any)!.map);

    // This is a little wonky, but subscribing to all observables in an observable array is something I could see wanting to do a lot.
    // Should make a utility function to handle this use case, if one doesnt already exist in rxjs.
    this._items$.subscribe((items) => {
      if (this._itemSubscription) {
        this._itemSubscription.unsubscribe();
      }

      if (items.length === 0) {
        this._plot$.next(null);
        return;
      }

      this._itemSubscription = combineLatest([
        this._map$,
        ...items.map((x) => x.plotItem$),
      ]).subscribe(([map, ...plotItems]) => {
        if (map == null) {
          return null;
        }
        this._plot$.next(plotter.plotItems(plotItems.filter(isNotNull), map));
      });
    });
  }

  get map$() {
    return this._map$;
  }

  get items$() {
    return this._items$;
  }

  get items(): readonly PlotBuilderItem[] {
    return this._items$.value;
  }

  get plot$() {
    return this._plot$;
  }

  loadFromShareString(dataStr: string) {
    const array = decodeBase64(dataStr);
    const dv = new DataView(array);
    const version = dv.getUint8(0);
    const data = array.slice(1);
    if (version === 0) {
      const decoded = JSON.parse(pako.inflate(data, { to: "string" })) as any[];
      const items = decoded.map((item) => {
        switch (item.type) {
          case "add-ingredient":
            return AddIngredientPlotBuilderItem.fromJSON(item, (item) =>
              this._deleteItem(item)
            );
          case "stir-cauldron":
            return StirCauldronPlotBuilderItem.fromJSON(item, (item) =>
              this._deleteItem(item)
            );
          case "pour-solvent":
            return PourSolventPlotBuilderItem.fromJSON(item, (item) =>
              this._deleteItem(item)
            );
          default:
            throw new Error(`Unknown item type: ${item.type}`);
        }
      });
      this._items$.next(items);
    }
  }

  getShareString() {
    const items = this._items$.value.map((x) => x.toJSON());
    const encoded = pako.deflate(JSON.stringify(items));
    const data = new Uint8Array(1 + encoded.length);
    data.set(encoded, 1);
    new DataView(data.buffer).setUint8(0, 0);
    return encodeBase64(data);
  }

  addIngredient(): AddIngredientPlotBuilderItem {
    const item = new AddIngredientPlotBuilderItem((item) =>
      this._deleteItem(item)
    );
    this._items$.next([...this._items$.value, item]);
    return item;
  }

  addStirCauldron(): StirCauldronPlotBuilderItem {
    const item = new StirCauldronPlotBuilderItem((item) =>
      this._deleteItem(item)
    );
    this._items$.next([...this._items$.value, item]);
    return item;
  }

  addPourSolvent(): PourSolventPlotBuilderItem {
    const item = new PourSolventPlotBuilderItem((item) =>
      this._deleteItem(item)
    );
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

export abstract class PlotBuilderItem {
  abstract readonly isValid$: Observable<boolean>;
  abstract readonly isValid: boolean;

  abstract readonly plotItem$: Observable<PlotItem | null>;
  abstract readonly plotItem: PlotItem | null;

  abstract delete(): void;

  abstract toJSON(): any;
}

export class AddIngredientPlotBuilderItem extends PlotBuilderItem {
  private readonly _isValid$: Observable<boolean>;
  private readonly _ingredientId$ = new BehaviorSubject<IngredientId | null>(
    null
  );
  private readonly _grindPercent$ = new BehaviorSubject<number>(1);

  private readonly _plotItem$ = new BehaviorSubject<PlotItem | null>(null);

  constructor(private readonly _delete: (item: PlotBuilderItem) => void) {
    super();
    this._isValid$ = combineLatest([
      this._ingredientId$,
      this._grindPercent$,
    ]).pipe(map(() => this.isValid));

    combineLatest([this._ingredientId$, this._grindPercent$]).subscribe(
      ([ingredientId, grindPercent]) => {
        if (!this.isValid) {
          this._plotItem$.next(null);
          return;
        }

        this._plotItem$.next({
          type: "add-ingredient",
          ingredientId: ingredientId as IngredientId,
          grindPercent,
        });
      }
    );
  }

  static fromJSON(
    json: any,
    del: (item: PlotBuilderItem) => void
  ): AddIngredientPlotBuilderItem {
    const item = new AddIngredientPlotBuilderItem(del);
    item.setIngredient(json.ingredientId);
    item.setGrindPercent(json.grindPercent);
    return item;
  }

  toJSON() {
    return {
      type: "add-ingredient",
      ingredientId: this._ingredientId$.value,
      grindPercent: this._grindPercent$.value,
    };
  }

  get isValid$() {
    return this._isValid$;
  }

  get isValid() {
    // TODO: Check if ingredientId is valid
    const grindPercent = this._grindPercent$.value;
    return (
      this._ingredientId$.value != null &&
      grindPercent >= 0 &&
      grindPercent <= 1
    );
  }

  get ingredientId$(): Observable<IngredientId | null> {
    return this._ingredientId$;
  }

  get ingredientId(): IngredientId | null {
    return this._ingredientId$.value;
  }

  get grindPercent$(): Observable<number> {
    return this._grindPercent$;
  }

  get plotItem$(): Observable<PlotItem | null> {
    return this._plotItem$;
  }

  get plotItem(): PlotItem | null {
    return this._plotItem$.value;
  }

  setIngredient(ingredientId: IngredientId | null) {
    if (ingredientId === this._ingredientId$.value) {
      return;
    }

    this._ingredientId$.next(ingredientId);
  }

  setGrindPercent(percent: number) {
    if (percent === this._grindPercent$.value) {
      return;
    }

    this._grindPercent$.next(percent);
  }

  delete() {
    this._delete(this);
  }
}

export class StirCauldronPlotBuilderItem extends PlotBuilderItem {
  private readonly _isValid$: Observable<boolean>;
  private readonly _distance$ = new BehaviorSubject<number | null>(null);

  private readonly _plotItem$ = new BehaviorSubject<PlotItem | null>(null);

  constructor(private readonly _delete: (item: PlotBuilderItem) => void) {
    super();
    this._isValid$ = combineLatest([this._distance$]).pipe(
      map(() => this.isValid)
    );

    combineLatest([this._distance$]).subscribe(([stirDistance]) => {
      if (!this.isValid) {
        this._plotItem$.next(null);
        return;
      }

      this._plotItem$.next({
        type: "stir-cauldron",
        distance: stirDistance!,
      });
    });
  }

  static fromJSON(
    json: any,
    del: (item: PlotBuilderItem) => void
  ): StirCauldronPlotBuilderItem {
    const item = new StirCauldronPlotBuilderItem(del);
    item.setDistance(json.distance);
    return item;
  }

  toJSON() {
    return {
      type: "stir-cauldron",
      distance: this._distance$.value,
    };
  }

  get isValid$() {
    return this._isValid$;
  }

  get isValid() {
    // TODO: Check if ingredientId is valid
    const stirDistance = this._distance$.value;
    return stirDistance != null && stirDistance >= 0;
  }

  get plotItem$(): Observable<PlotItem | null> {
    return this._plotItem$;
  }

  get plotItem(): PlotItem | null {
    return this._plotItem$.value;
  }

  get distance$(): Observable<number | null> {
    return this._distance$;
  }

  setDistance(distance: number | null) {
    this._distance$.next(distance);
  }

  delete() {
    this._delete(this);
  }
}

export class PourSolventPlotBuilderItem extends PlotBuilderItem {
  private readonly _isValid$: Observable<boolean>;
  private readonly _distance$ = new BehaviorSubject<number | null>(null);

  private readonly _plotItem$ = new BehaviorSubject<PlotItem | null>(null);

  constructor(private readonly _delete: (item: PlotBuilderItem) => void) {
    super();
    this._isValid$ = combineLatest([this._distance$]).pipe(
      map(() => this.isValid)
    );

    combineLatest([this._distance$]).subscribe(([stirDistance]) => {
      if (!this.isValid) {
        this._plotItem$.next(null);
        return;
      }

      this._plotItem$.next({
        type: "pour-solvent",
        distance: stirDistance!,
      });
    });
  }

  static fromJSON(
    json: any,
    del: (item: PlotBuilderItem) => void
  ): PourSolventPlotBuilderItem {
    const item = new PourSolventPlotBuilderItem(del);
    item.setDistance(json.distance);
    return item;
  }

  toJSON() {
    return {
      type: "pour-solvent",
      distance: this._distance$.value,
    };
  }

  get isValid$() {
    return this._isValid$;
  }

  get isValid() {
    // TODO: Check if ingredientId is valid
    const stirDistance = this._distance$.value;
    return stirDistance != null && stirDistance >= 0;
  }

  get plotItem$(): Observable<PlotItem | null> {
    return this._plotItem$;
  }

  get plotItem(): PlotItem | null {
    return this._plotItem$.value;
  }

  get distance$(): Observable<number | null> {
    return this._distance$;
  }

  setDistance(distance: number | null) {
    this._distance$.next(distance);
  }

  delete() {
    this._delete(this);
  }
}