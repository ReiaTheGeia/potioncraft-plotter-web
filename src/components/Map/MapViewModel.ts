import { Observable } from "rxjs";

import { Point } from "@/points";
import { Size } from "@/size";

export interface IMapViewModel {
  readonly viewportSize$: Observable<Size>;
  readonly viewOffset$: Observable<Point>;
  readonly viewScale$: Observable<number>;
}
