import React from "react";

export function usePromise<T>(
  promise: (() => Promise<T> | null | undefined) | Promise<T> | null | undefined
): T | undefined {
  const cachedPromise = React.useRef<any>(undefined);
  const [val, setVal] = React.useState<T | undefined>(undefined);

  React.useEffect(() => {
    if (cachedPromise.current === promise) {
      return;
    }
    cachedPromise.current = promise;

    let promiseValue: Promise<T> | null = null;
    if (typeof promise === "function") {
      promiseValue = promise() ?? null;
    } else if (promise) {
      promiseValue = promise;
    }

    if (promiseValue) {
      promiseValue.then((val) => {
        if (promise === cachedPromise.current) {
          // Only capture value if the promise hasn't changed.
          setVal(val);
        }
      });
    }
  }, [promise, val]);

  return val;
}
