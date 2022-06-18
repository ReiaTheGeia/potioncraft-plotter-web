import {
  combineLatest,
  OperatorFunction,
  Observable,
  Subscription,
} from "rxjs";

export function observeAll<K>(): OperatorFunction<Observable<K>[], K[]> {
  return (source: Observable<Observable<K>[]>) => {
    return new Observable<K[]>((subscriber) => {
      let subscription: Subscription | null = null;
      source.subscribe({
        next: (observables) => {
          if (subscription) {
            subscription.unsubscribe();
            subscription = null;
          }

          if (observables.length === 0) {
            subscriber.next([]);
            return;
          }

          subscription = combineLatest(observables).subscribe((values) => {
            subscriber.next(values);
          });
        },
        complete: () => subscriber.complete(),
        error: (err) => subscriber.error(err),
      });
    });
  };
}
