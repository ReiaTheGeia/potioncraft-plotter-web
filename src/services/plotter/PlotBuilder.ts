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
      this._itemSubscription = combineLatest(
        items.map((x) => x.plotItem$)
      ).subscribe((plotItems) => {
        if (plotItems.length === 0 || plotItems.indexOf(null) !== -1) {
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

  get plot$() {
    return this._plot$;
  }

  addIngredient(): AddIngredientPlotBuilderItem {
    const item = new AddIngredientPlotBuilderItem();
    this._items$.next([...this._items$.value, item]);
    return item;
  }
}

export abstract class PlotBuilderItem {
  abstract readonly isValid$: Observable<boolean>;
  abstract readonly isValid: boolean;

  abstract readonly plotItem$: Observable<PlotItem | null>;
}

export class AddIngredientPlotBuilderItem extends PlotBuilderItem {
  private readonly _isValid$: Observable<boolean>;
  private readonly _ingredientId$ = new BehaviorSubject<IngredientId | null>(
    null
  );
  private readonly _grindPercent$ = new BehaviorSubject<number>(1);

  private readonly _plotItem$: Observable<PlotItem | null>;

  constructor() {
    super();
    this._isValid$ = combineLatest([
      this._ingredientId$,
      this._grindPercent$,
    ]).pipe(map(() => this.isValid));

    this._plotItem$ = combineLatest([
      this._ingredientId$,
      this._grindPercent$,
    ]).pipe(
      map(([ingredientId, grindPercent]) => {
        if (!this.isValid) {
          return null;
        }

        return {
          type: "add-ingredient",
          ingredientId: ingredientId as IngredientId,
          grindPercent,
        };
      })
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

  setIngredient(ingredientId: IngredientId) {
    this._ingredientId$.next(ingredientId);
  }

  setGrindPercent(percent: number) {
    this._grindPercent$.next(percent);
  }
}
