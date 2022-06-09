import React from "react";
import { Observable } from "rxjs";

export interface UseObservationOpts {
  useTransition?: boolean;
  onError?: (err: Error) => void;
}
export function useObservation<T>(
  observable: Observable<T> | T | null | undefined,
  { useTransition, onError }: UseObservationOpts = {}
): T | undefined {
  const [val, setVal] = React.useState<T | undefined>(undefined);

  React.useEffect(() => {
    if (observable) {
      if (observable instanceof Observable) {
        const subscription = observable.subscribe({
          next: (val) => {
            if (useTransition) {
              React.startTransition(() => setVal(val));
            } else {
              setVal(val);
            }
          },
          error: onError,
        });
        return () => subscription.unsubscribe();
      } else {
        setVal(observable);
      }
    }
  }, [observable, onError, useTransition]);

  return val;
}
