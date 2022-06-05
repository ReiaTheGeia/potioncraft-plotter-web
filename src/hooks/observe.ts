import React from "react";
import { Observable } from "rxjs";

export function useObservation<T>(
  observable: Observable<T> | T | null | undefined,
  onError?: (err: Error) => void
): T | undefined {
  const [val, setVal] = React.useState<T | undefined>(undefined);

  React.useEffect(() => {
    if (observable) {
      if (observable instanceof Observable) {
        const subscription = observable.subscribe(setVal, onError);
        return () => subscription.unsubscribe();
      } else {
        setVal(observable);
      }
    }
  }, [observable, onError]);

  return val;
}
