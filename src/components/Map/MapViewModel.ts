import { Observable } from "rxjs";

import { Point } from "@/points";

export interface IMapViewModel {
  readonly viewOffset$: Observable<Point>;
  readonly viewScale$: Observable<number>;
}
