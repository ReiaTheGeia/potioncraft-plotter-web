import { Observable } from "rxjs";

import { Vector2 } from "@/points";
import { Size } from "@/size";

export interface IMapViewModel {
  readonly viewportSize$: Observable<Size>;
  readonly viewOffset$: Observable<Vector2>;
  readonly viewScale$: Observable<number>;
}
