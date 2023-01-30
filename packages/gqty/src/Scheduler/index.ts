import type { GQtyError } from '../Error';
import type { InterceptorManager } from '../Interceptor';
import { Selection, SelectionType } from '../Selection';
import { createDeferredPromise, DeferredPromise } from '../Utils';
import { debounce } from '../Utils/debounce';

export type SchedulerPromiseValue = {
  error?: GQtyError;
  data?: unknown;
  selections: Set<Selection>;
};
export type ResolvingLazyPromise = DeferredPromise<SchedulerPromiseValue>;
export type ResolvedLazyPromise = Promise<SchedulerPromiseValue>;
export type ResolveSubscriptionFn = (
  promise: ResolvedLazyPromise,
  selection: Selection
) => void;
export type ErrorSubscriptionEvent =
  | {
      type: 'new_error';
      newError: GQtyError;
      selections: Selection[];
      isLastTry: boolean;
    }
  | {
      type: 'errors_clean';
      selectionsCleaned: Selection[];
    }
  | {
      type: 'retry';
      retryPromise: Promise<SchedulerPromiseValue>;
      selections: Set<Selection>;
    };
export type ErrorSubscriptionFn = (event: ErrorSubscriptionEvent) => void;
export type IsFetchingSubscriptionFn = (isFetching: boolean) => void;

export interface Scheduler {
  resolving: DeferredPromise<SchedulerPromiseValue> | null;
  subscribeResolve: (
    fn: (promise: Promise<SchedulerPromiseValue>, selection: Selection) => void
  ) => () => void;
  errors: {
    map: Map<Selection, GQtyError>;
    subscribeErrors: (fn: ErrorSubscriptionFn) => () => void;
    triggerError: (
      newError: GQtyError,
      selections: Selection[],
      isLastTry: boolean
    ) => void;
    removeErrors: (selectionsCleaned: Selection[]) => void;
    retryPromise: (
      retryPromise: Promise<SchedulerPromiseValue>,
      selections: Set<Selection>
    ) => void;
  };
  isFetching: boolean;
  pendingSelectionsGroups: Set<Set<Selection>>;
  pendingSelectionsGroupsPromises: Map<
    Set<Selection>,
    Promise<SchedulerPromiseValue>
  >;
  getResolvingPromise(
    selections: Selection | Set<Selection>
  ): ResolvedLazyPromise | void;
}

export const createScheduler = (
  { globalInterceptor }: InterceptorManager,
  resolveSchedulerSelections: (selections: Set<Selection>) => Promise<void>,
  catchSelectionsTimeMS: number
) => {
  const resolveListeners = new Set<ResolveSubscriptionFn>();
  const notifyResolves = (
    promise: ResolvedLazyPromise,
    selection: Selection
  ) => {
    for (const notify of resolveListeners) {
      notify(promise, selection);
    }
  };

  const errorsListeners = new Set<ErrorSubscriptionFn>();
  const errorsMap = new Map<Selection, GQtyError>();
  const notifyErrors = (event: ErrorSubscriptionEvent) => {
    for (const notify of errorsListeners) {
      notify(event);
    }
  };

  const pendingSelectionsGroups = new Set<Set<Selection>>();
  const pendingSelectionsGroupsPromises = new Map<
    Set<Selection>,
    ResolvedLazyPromise
  >();
  const selectionsOnTheFly = new Set<Selection>();
  const selectionsWithFinalErrors = new Set<Selection>();

  const scheduler: Scheduler = {
    resolving: null,
    subscribeResolve: (fn) => {
      resolveListeners.add(fn);

      return () => {
        resolveListeners.delete(fn);
      };
    },
    errors: {
      map: errorsMap,
      subscribeErrors: (fn) => {
        errorsListeners.add(fn);

        return () => {
          errorsListeners.delete(fn);
        };
      },
      triggerError: (newError, selections, isLastTry) => {
        if (!selections.length) return;

        for (const selection of selections) {
          errorsMap.set(selection, newError);
        }

        notifyErrors({
          type: 'new_error',
          newError,
          selections,
          isLastTry,
        });
      },
      removeErrors: (selectionsCleaned: Selection[]) => {
        if (errorsMap.size === 0) return;

        for (const selection of selectionsCleaned) {
          errorsMap.delete(selection);
          selectionsWithFinalErrors.delete(selection);
        }

        notifyErrors({
          type: 'errors_clean',
          selectionsCleaned,
        });
      },
      retryPromise: (retryPromise, selections) => {
        pendingSelectionsGroups.add(selections);
        pendingSelectionsGroupsPromises.set(selections, retryPromise);

        retryPromise.finally(() => {
          pendingSelectionsGroups.delete(selections);
          pendingSelectionsGroupsPromises.delete(selections);
        });

        notifyErrors({
          type: 'retry',
          retryPromise,
          selections,
        });
      },
    },
    isFetching: false,
    pendingSelectionsGroups,
    pendingSelectionsGroupsPromises,
    getResolvingPromise: (selections) => {
      if (selections instanceof Selection) {
        for (const [group, promise] of pendingSelectionsGroupsPromises) {
          if (group.has(selections)) return promise;
        }
      } else {
        for (const selection of selections) {
          for (const [group, promise] of pendingSelectionsGroupsPromises) {
            if (group.has(selection)) return promise;
          }
        }
      }

      return;
    },
  };

  let resolvingPromise: ResolvingLazyPromise | null = null;

  const fetchSelections = debounce((lazyPromise: ResolvingLazyPromise) => {
    resolvingPromise = null;

    selectionsOnTheFly.clear();
    pendingSelectionsGroups.delete(selectionsOnTheFly);
    pendingSelectionsGroupsPromises.delete(selectionsOnTheFly);

    const selectionsToFetch = new Set(globalInterceptor.fetchSelections);
    pendingSelectionsGroups.add(selectionsToFetch);
    pendingSelectionsGroupsPromises.set(selectionsToFetch, lazyPromise.promise);

    resolveSchedulerSelections(selectionsToFetch).then(
      () => {
        pendingSelectionsGroups.delete(selectionsToFetch);
        pendingSelectionsGroupsPromises.delete(selectionsToFetch);
        if (scheduler.resolving === lazyPromise) {
          scheduler.resolving = null;
        }

        lazyPromise.resolve({ selections: selectionsToFetch });
      },
      (error) => {
        pendingSelectionsGroups.delete(selectionsToFetch);
        pendingSelectionsGroupsPromises.delete(selectionsToFetch);
        if (scheduler.resolving === lazyPromise) {
          scheduler.resolving = null;
        }

        lazyPromise.resolve({
          error,
          selections: selectionsToFetch,
        });
      }
    );
  }, catchSelectionsTimeMS);

  function addSelectionToScheduler(selection: Selection, notifyResolve = true) {
    if (selection.type === SelectionType.Subscription) {
      notifyResolve = false;
    }

    {
      const promise = scheduler.getResolvingPromise(selection);
      if (notifyResolve && promise) {
        notifyResolves(promise, selection);
      }
    }

    const lazyPromise =
      resolvingPromise ?? createDeferredPromise<SchedulerPromiseValue>();
    if (resolvingPromise === null) {
      lazyPromise.promise.then(({ error }) => {
        if (error) console.error(error);
      });

      resolvingPromise = lazyPromise;
      scheduler.resolving = lazyPromise;
    }

    pendingSelectionsGroups.add(selectionsOnTheFly);
    selectionsOnTheFly.add(selection);
    pendingSelectionsGroupsPromises.set(
      selectionsOnTheFly,
      lazyPromise.promise
    );

    if (notifyResolve) {
      notifyResolves(lazyPromise.promise, selection);
    }

    fetchSelections(lazyPromise);
  }

  globalInterceptor.selectionAddListeners.add((selection) => {
    addSelectionToScheduler(selection);
  });

  globalInterceptor.selectionCacheRefetchListeners.add((selection) =>
    addSelectionToScheduler(selection, false)
  );

  return scheduler;
};
