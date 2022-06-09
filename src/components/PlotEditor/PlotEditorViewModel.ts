import { BehaviorSubject, map, Observable } from "rxjs";

import { inject } from "microinject";

import { Point } from "@/points";

import { PlotBuilder, PlotBuilderItem } from "@/services/plotter/PlotBuilder";
import { PlotItem } from "@/services/plotter/types";

import { IPlotViewModel, PlotViewModel } from "../Plot/PlotViewModel";

export class PlotEditorViewModel implements IPlotViewModel {
  private readonly _plotViewModel = new PlotViewModel();
  private readonly _mouseOverBuilderItem$ =
    new BehaviorSubject<PlotBuilderItem | null>(null);
  private readonly _shareString$: Observable<string>;

  constructor(@inject(PlotBuilder) private readonly _builder: PlotBuilder) {
    this._shareString$ = this._builder.plot$.pipe(
      map((x) => _builder.getShareString())
    );
  }

  get builder(): PlotBuilder {
    return this._builder;
  }

  get shareString$(): Observable<string> {
    return this._shareString$;
  }

  get viewOffset$(): Observable<Point> {
    return this._plotViewModel.viewOffset$;
  }
  get viewScale$(): Observable<number> {
    return this._plotViewModel.viewScale$;
  }

  get mouseOverItem$(): Observable<PlotItem | null> {
    return this._plotViewModel.mouseOverItem$;
  }

  get mouseOverBuilderItem$(): Observable<PlotBuilderItem | null> {
    return this._mouseOverBuilderItem$;
  }

  viewportResize(width: number, height: number): void {
    this._plotViewModel.viewportResize(width, height);
  }

  zoom(delta: number, on: Point | null | undefined): void {
    this._plotViewModel.zoom(delta, on);
  }

  pan(dx: number, dy: number): void {
    this._plotViewModel.pan(dx, dy);
  }

  onMouseOverPlotItem(item: PlotItem | null): void {
    this._plotViewModel.onMouseOverPlotItem(item);
    this._mouseOverBuilderItem$.next(
      item ? this._builder.builderItemFor(item) : null
    );
  }

  onMouseOverBuilderItem(item: PlotBuilderItem | null): void {
    this._mouseOverBuilderItem$.next(item);
    this._plotViewModel.onMouseOverPlotItem(item ? item.plotItem : null);
  }
}
