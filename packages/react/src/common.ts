import {
  castNotSkeleton,
  castNotSkeletonDeep,
  getArrayFields,
  getFields,
  GQtyError,
  prepass,
  ResolveOptions,
  selectFields,
  Selection,
} from 'gqty';
import type { ProxyAccessor } from 'gqty/Cache';
import type { EventHandler } from 'gqty/Events';
import type { InterceptorManager } from 'gqty/Interceptor';
import type { Scheduler } from 'gqty/Scheduler';
import * as React from 'react';

export function useOnFirstMount(fn: () => void) {
  const isFirstMount = React.useRef(true);
  if (isFirstMount.current) {
    isFirstMount.current = false;
    fn();
  }
}

export const IS_BROWSER = typeof window !== 'undefined';

export const useIsomorphicLayoutEffect = IS_BROWSER
  ? React.useLayoutEffect
  : React.useEffect;

export function useForceUpdate({ doTimeout }: { doTimeout?: boolean } = {}) {
  const [, update] = React.useReducer((num) => (num + 1) % 1_000_000, 0);
  const wasCalled = React.useRef(false);

  React.useEffect(() => {
    wasCalled.current = false;
  });

  return React.useMemo(() => {
    return Object.assign(
      () => {
        if (wasCalled.current) return;
        wasCalled.current = true;
        if (doTimeout) {
          setTimeout(update, 0);
        } else {
          Promise.resolve().then(update);
        }
      },
      { wasCalled }
    );
  }, [update, wasCalled, doTimeout]);
}

const InitSymbol: any = Symbol();

export function useLazyRef<T>(initialValFunc: () => T) {
  const ref: React.MutableRefObject<T> = React.useRef(InitSymbol);
  if (ref.current === InitSymbol) {
    ref.current = initialValFunc();
  }
  return ref;
}

export const useUpdateEffect: typeof React.useEffect = (effect, deps) => {
  const firstEffectCall = React.useRef(true);

  React.useEffect(() => {
    if (firstEffectCall.current) {
      firstEffectCall.current = false;
    } else return effect();
  }, deps);
};

export function useIsRendering() {
  const isRendering = React.useRef(true);
  isRendering.current = true;

  useIsomorphicLayoutEffect(() => {
    isRendering.current = false;
  });

  return isRendering;
}

export function useIsMounted() {
  const isMounted = React.useRef(true);

  useIsomorphicLayoutEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  return isMounted;
}

export function useDeferDispatch<F extends (...args: any[]) => void>(
  dispatchFn: F
) {
  const isMounted = useIsMounted();
  const isRendering = useIsRendering();

  const pendingDispatch = React.useRef<Array<() => void> | false>(false);

  React.useEffect(() => {
    if (pendingDispatch.current) {
      for (const fn of pendingDispatch.current) {
        fn();
      }
      pendingDispatch.current = false;
    }
  });

  return React.useCallback(
    (...args: any[]) => {
      if (isRendering.current) {
        if (pendingDispatch.current) {
          pendingDispatch.current.push(() => {
            if (isMounted.current) dispatchFn(...args);
          });
        }
        pendingDispatch.current = [
          () => {
            if (isMounted.current) dispatchFn(...args);
          },
        ];
      } else if (isMounted.current) {
        dispatchFn(...args);
      }
    },
    [dispatchFn, isRendering, pendingDispatch, isMounted]
  ) as F;
}

export type FetchPolicy =
  | 'cache-and-network'
  | 'cache-first'
  | 'network-only'
  | 'no-cache';

const noCacheResolveOptions: ResolveOptions<unknown> = {
  noCache: true,
};

const refetchResolveOptions: ResolveOptions<unknown> = {
  refetch: true,
};

const emptyResolveOptions: ResolveOptions<unknown> = {};

export function fetchPolicyDefaultResolveOptions(
  fetchPolicy: FetchPolicy | undefined
): ResolveOptions<unknown> {
  switch (fetchPolicy) {
    case 'no-cache': {
      return noCacheResolveOptions;
    }
    case 'cache-and-network':
    case 'network-only': {
      return refetchResolveOptions;
    }
    case 'cache-first':
    default: {
      return emptyResolveOptions;
    }
  }
}

export type BuildSelections<T> = (Selection | T)[];

export function useBuildSelections(
  argSelections: BuildSelections<never> | null | undefined,
  getProxySelection: (proxy: ProxyAccessor) => Selection | undefined,
  caller: Function
) {
  const buildSelections = React.useCallback(
    (selectionsSet: Set<Selection>) => {
      selectionsSet.clear();

      if (!argSelections) return;

      try {
        for (const filterValue of argSelections) {
          let selection: Selection | undefined;
          if (filterValue instanceof Selection) {
            selectionsSet.add(filterValue);
          } else if ((selection = getProxySelection(filterValue))) {
            selectionsSet.add(selection);
          }
        }
      } catch (err) {
        if (err instanceof Error && Error.captureStackTrace!) {
          Error.captureStackTrace(err, caller);
        }

        throw err;
      }
    },
    [argSelections]
  );

  const [selections] = React.useState(() => {
    const selectionsSet = new Set<Selection>();

    buildSelections(selectionsSet);

    return selectionsSet;
  });

  useUpdateEffect(() => {
    buildSelections(selections);
  }, [buildSelections, selections]);

  return {
    selections,
    hasSpecifiedSelections: argSelections != null,
  };
}

export type List<T> = Set<T> | Array<T>;

export function toSetIfNeeded<T>(list: List<T>): Set<T> {
  return Array.isArray(list) ? new Set(list) : list;
}

export function isSelectionIncluded(
  selection: Selection,
  selectionList: List<Selection>
) {
  const setSelectionList = toSetIfNeeded(selectionList);

  if (setSelectionList.has(selection)) return true;

  for (const listValue of selectionList) {
    if (setSelectionList.has(listValue)) return true;
  }

  return false;
}

export function isAnySelectionIncluded(
  selectionsToCheck: List<Selection>,
  selectionsList: List<Selection>
) {
  const setSelectionList = toSetIfNeeded(selectionsList);
  for (const selection of selectionsToCheck) {
    if (isSelectionIncluded(selection, setSelectionList)) return true;
  }

  return false;
}

export function isAnySelectionIncludedInMatrix(
  selectionsToCheck: List<Selection>,
  selectionsMatrix: List<List<Selection>>
) {
  const selectionsToCheckSet = toSetIfNeeded(selectionsToCheck);

  for (const group of selectionsMatrix) {
    if (isAnySelectionIncluded(selectionsToCheckSet, group)) return true;
  }

  return false;
}

function initSelectionsState() {
  return new Set<Selection>();
}

export function useSelectionsState() {
  const [selections] = React.useState(initSelectionsState);

  return selections;
}

export function useSubscribeCacheChanges({
  selections,
  eventHandler,
  onChange,
  shouldSubscribe = true,
}: {
  selections: Set<Selection>;
  eventHandler: EventHandler;
  onChange: () => void;
  shouldSubscribe?: boolean;
}) {
  const onChangeCalled = React.useRef(false);
  useIsomorphicLayoutEffect(() => {
    onChangeCalled.current = false;
  });

  useIsomorphicLayoutEffect(() => {
    if (!shouldSubscribe) return;

    let isMounted = true;
    const unsubscribeFetch = eventHandler.onFetchSubscribe(
      (fetchPromise, promiseSelections) => {
        if (
          onChangeCalled.current ||
          !promiseSelections.some((selection) => selections.has(selection))
        ) {
          return;
        }

        onChangeCalled.current = true;
        fetchPromise.then(
          () => {
            if (isMounted) Promise.resolve(fetchPromise).then(onChange);
          },
          () => {}
        );
      }
    );

    const unsubscribeCache = eventHandler.onCacheChangeSubscribe(
      ({ selection }) => {
        if (isMounted && !onChangeCalled.current && selections.has(selection)) {
          onChangeCalled.current = true;
          Promise.resolve().then(onChange);
        }
      }
    );

    return () => {
      isMounted = false;
      unsubscribeFetch();
      unsubscribeCache();
    };
  }, [shouldSubscribe, selections, eventHandler, onChange]);
}

function hasEnabledStaleWhileRevalidate(
  staleWhileRevalidate: boolean | object | number | string | null
) {
  return typeof staleWhileRevalidate === 'boolean'
    ? staleWhileRevalidate
    : true;
}

export function useInterceptSelections({
  interceptorManager: {
    globalInterceptor,
    createInterceptor,
    removeInterceptor,
  },
  staleWhileRevalidate = false,
  scheduler,
  eventHandler,
  onError,
  updateOnFetchPromise,
}: {
  staleWhileRevalidate: boolean | object | number | string | null;
  interceptorManager: InterceptorManager;
  scheduler: Scheduler;
  eventHandler: EventHandler;
  onError: OnErrorHandler | undefined;
  updateOnFetchPromise?: boolean;
}) {
  const enabledStaleWhileRevalidate =
    hasEnabledStaleWhileRevalidate(staleWhileRevalidate);
  const cacheRefetchSelections = enabledStaleWhileRevalidate
    ? new Set<Selection>()
    : null;
  const fetchingPromise = React.useRef<Promise<void> | null>(null);
  const forceUpdate = useDeferDispatch(useForceUpdate());
  const interceptor = createInterceptor();
  const selections = useSelectionsState();

  interceptor.selectionCacheRefetchListeners.add((selection) => {
    if (cacheRefetchSelections) {
      cacheRefetchSelections.add(selection);
    }

    selections.add(selection);
  });

  useIsomorphicLayoutEffect(() => {
    if (enabledStaleWhileRevalidate && cacheRefetchSelections?.size) {
      for (const selection of cacheRefetchSelections) {
        globalInterceptor.addSelectionCacheRefetch(selection);
      }
    }
  }, [staleWhileRevalidate, enabledStaleWhileRevalidate]);

  interceptor.selectionAddListeners.add((selection) => {
    selections.add(selection);
  });

  interceptor.selectionCacheListeners.add((selection) => {
    selections.add(selection);
  });

  const deferredCall = React.useRef<(() => void) | null>(null);

  React.useEffect(() => {
    if (deferredCall.current) {
      deferredCall.current();
      deferredCall.current = null;
    }
  });

  const isRendering = useIsRendering();

  const unsubscribeResolve = scheduler.subscribeResolve(
    (promise, selection) => {
      if (
        fetchingPromise.current === null &&
        deferredCall.current === null &&
        selections.has(selection)
      ) {
        const newPromise = new Promise<void>((resolve) => {
          promise.then(({ error }) => {
            fetchingPromise.current = null;
            if (error && onError) onError(error);

            Promise.resolve().then(forceUpdate);

            resolve();
          });
        });

        fetchingPromise.current = newPromise;

        if (updateOnFetchPromise) {
          if (enabledStaleWhileRevalidate && isRendering.current) {
            deferredCall.current = forceUpdate;
          } else {
            deferredCall.current = null;
            forceUpdate();
          }
        }
      }
    }
  );

  function unsubscribe() {
    unsubscribeResolve();
    removeInterceptor(interceptor);
  }

  Promise.resolve().then(unsubscribe);

  useSubscribeCacheChanges({
    selections,
    eventHandler,
    onChange() {
      if (!fetchingPromise.current) forceUpdate();
    },
  });

  return {
    fetchingPromise,
    selections,
    unsubscribe,
  };
}

export function useSuspensePromise(optsRef: {
  current: { suspense?: boolean };
}) {
  let [promise, setPromiseState] = React.useState<Promise<unknown> | void>();

  const isMounted = useIsMounted();

  const setPromise = React.useCallback<
    (promise: Promise<unknown>, inlineThrow?: boolean) => void
  >(
    (newPromise, inlineThrow) => {
      if (promise || !optsRef.current.suspense || !isMounted.current) return;

      function clearPromise() {
        if (isMounted.current) setPromiseState();
      }

      const promiseValue = (promise = newPromise.then(
        clearPromise,
        clearPromise
      ));

      setPromiseState(promiseValue);

      if (inlineThrow) throw promiseValue;
    },
    [setPromiseState, optsRef]
  );

  if (promise) throw promise;

  return setPromise;
}

export type OnErrorHandler = (error: GQtyError) => void;

export interface CoreHelpers {
  prepass: typeof prepass;
  getFields: typeof getFields;
  getArrayFields: typeof getArrayFields;
  selectFields: typeof selectFields;
  castNotSkeleton: typeof castNotSkeleton;
  castNotSkeletonDeep: typeof castNotSkeletonDeep;
}

export const coreHelpers: CoreHelpers = {
  prepass,
  getFields,
  getArrayFields,
  selectFields,
  castNotSkeleton,
  castNotSkeletonDeep,
};

export function uniqBy<TNode>(
  list: TNode[],
  cb?: (node: TNode) => unknown
): TNode[] {
  const uniqList = new Map<unknown, TNode>();
  for (const value of list) {
    let key: unknown = cb ? cb(value) : value;

    if (uniqList.has(key)) continue;
    uniqList.set(key, value);
  }
  return Array.from(uniqList.values());
}

const compare = (a: string | number, b: string | number) =>
  a < b ? -1 : a > b ? 1 : 0;

export function sortBy<TNode>(
  list: TNode[],
  cb: (node: TNode) => number | string,
  order: 'asc' | 'desc' = 'asc'
): TNode[] {
  const orderedList = Array.from(list);

  orderedList.sort((a, b) => compare(cb(a), cb(b)));

  if (order === 'desc') orderedList.reverse();

  return orderedList;
}

export const useIsWindowVisible = ({ lazy }: { lazy?: boolean } = {}) => {
  const [isVisible, setIsVisible] = React.useState(true);
  const ref = React.useRef(true);

  React.useEffect(() => {
    const onVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';
      ref.current = isVisible;
      !lazy && setIsVisible(isVisible);
    };

    onVisibilityChange();

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [setIsVisible, lazy]);

  return React.useMemo(() => {
    return {
      isVisible,
      ref,
    };
  }, [isVisible, ref]);
};
