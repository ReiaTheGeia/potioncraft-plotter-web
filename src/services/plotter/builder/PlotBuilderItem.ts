import { Observable } from "rxjs";
import { PlotItem } from "../types";

export abstract class PlotBuilderItem {
  abstract readonly isValid$: Observable<boolean>;
  abstract readonly isValid: boolean;

  abstract readonly plotItem$: Observable<PlotItem | null>;
  abstract readonly plotItem: PlotItem | null;

  abstract delete(): void;
}
