import { BehaviorSubject, combineLatest, Observable, map } from "rxjs";

import { IngredientId } from "@/services/ingredients/types";

import { AddIngredientPlotItem, PlotItem } from "@/services/plotter/types";

import { PlotBuilderItem } from "./PlotBuilderItem";

export class AddIngredientPlotBuilderItem
  implements PlotBuilderItem<AddIngredientPlotItem>
{
  private readonly _isValid$: Observable<boolean>;
  private readonly _ingredientId$ = new BehaviorSubject<IngredientId | null>(
    null
  );
  private readonly _grindPercent$ = new BehaviorSubject<number | null>(1);

  private readonly _plotItem$ = new BehaviorSubject<PlotItem | null>(null);

  constructor(private readonly _delete: (item: PlotBuilderItem) => void) {
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
          grindPercent: grindPercent!,
        });
      }
    );
  }

  get type() {
    return "add-ingredient" as const;
  }

  get isValid$() {
    return this._isValid$;
  }

  get isValid() {
    // TODO: Check if ingredientId is valid
    const grindPercent = this._grindPercent$.value;
    return (
      this._ingredientId$.value != null &&
      grindPercent != null &&
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

  get grindPercent$(): Observable<number | null> {
    return this._grindPercent$;
  }

  get plotItem$(): Observable<PlotItem | null> {
    return this._plotItem$;
  }

  get plotItem(): PlotItem | null {
    return this._plotItem$.value;
  }

  setIngredientId(ingredientId: IngredientId | null) {
    if (ingredientId === this._ingredientId$.value) {
      return;
    }

    this._ingredientId$.next(ingredientId);
  }

  setGrindPercent(percent: number | null) {
    if (percent === this._grindPercent$.value) {
      return;
    }

    this._grindPercent$.next(percent);
  }

  delete() {
    this._delete(this);
  }
}
