import { inject, injectable } from "microinject";
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  Subscription,
} from "rxjs";
import { IngredientId } from "../ingredients/types";

import { Plotter } from "./Plotter";
import { PlotItem, PlotResult } from "./types";

@injectable()
export class PlotBuilder {
  private readonly _items$ = new BehaviorSubject<readonly PlotBuilderItem[]>(
    []
  );
  private _itemSubscription: Subscription | null = null;
  private readonly _plot$ = new BehaviorSubject<PlotResult | null>(null);

  constructor(@inject(Plotter) plotter: Plotter) {
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

      this._itemSubscription = combineLatest(
        items.map((x) => x.plotItem$)
      ).subscribe((plotItems) => {
        if (plotItems.indexOf(null) !== -1) {
          this._plot$.next(null);
        } else {
          this._plot$.next(plotter.plotItems(plotItems as PlotItem[]));
        }
      });
    });
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
          return null;
        }

        this._plotItem$.next({
          type: "add-ingredient",
          ingredientId: ingredientId as IngredientId,
          grindPercent,
        });
      }
    );
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
    this._ingredientId$.next(ingredientId);
  }

  setGrindPercent(percent: number) {
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
        return null;
      }

      this._plotItem$.next({
        type: "stir-cauldron",
        distance: stirDistance!,
      });
    });
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
        return null;
      }

      this._plotItem$.next({
        type: "pour-solvent",
        distance: stirDistance!,
      });
    });
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
