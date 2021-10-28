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
// import {
//   MutableRefObject,
//   useCallback,
//   useEffect,
//   useLayoutEffect,
//   useMemo,
//   useReducer,
//   useRef,
//   useState,
// } from 'react';
import type { Ref } from 'vue-demi';
import { ref, getCurrentInstance, onUnmounted, triggerRef } from 'vue-demi';

// export function useOnFirstMount(fn: () => void) {
//     const isFirstMount = ref(true);
//     if (isFirstMount.value) {
//         isFirstMount.value = false;
//         fn();
//     }
// }

// export const IS_BROWSER = typeof window !== 'undefined';

// export const useIsomorphicLayoutEffect = watchEffect;
// export const useIsomorphicLayoutEffect = IS_BROWSER
//   ? useLayoutEffect
//   : watch;

// const updateReducer = (num: number): number => (num + 1) % 1_000_000;
//
// export function useForceUpdate({
//                                    doTimeout,
//                                }: { doTimeout?: boolean } = {}): ComputedRef {
//     const [, update] = useReducer(updateReducer, 0);
//
//     const wasCalled = ref(false);
//
//     watchEffect(() => {
//         wasCalled.value = false;
//     });
//
//     return computed(() => {
//         return Object.assign(
//             () => {
//                 if (wasCalled.value) return;
//                 wasCalled.value = true;
//                 if (doTimeout) {
//                     setTimeout(update, 0);
//                 } else {
//                     Promise.resolve().then(update);
//                 }
//             },
//             {
//                 wasCalled,
//             },
//         );
//     });
// }

// const InitSymbol: any = Symbol();

// export function useLazyRef<T>(initialValFunc: () => T) {
//     const localRef: Ref<T> = ref(InitSymbol);
//     if (localRef.value === InitSymbol) {
//         localRef.value = initialValFunc();
//     }
//     return localRef;
// }

// export const useUpdateEffect: (effect: any) => void = (effect) => {
//     const firstEffectCall = ref(true);
//
//     watchEffect(() => {
//         if (firstEffectCall.value) {
//             firstEffectCall.value = false;
//         } else
//             return effect(() => {
//                 console.log('ode: test update effect');
//             });
//     });
// };

// export function useIsRendering() {
//     const isRendering = ref(true);
//     isRendering.value = true;
//
//     useIsomorphicLayoutEffect(() => {
//         isRendering.value = false;
//     });
//
//     return isRendering;
// }
//
// export function useIsMounted() {
//     const isMounted = ref(true);
//
//     useIsomorphicLayoutEffect(() => {
//         isMounted.value = true;
//
//         return () => {
//             isMounted.value = false;
//         };
//     });
//
//     return isMounted;
// }

// export function useDeferDispatch(
//     dispatchFn: Ref,
// ) {
//     const instance = getCurrentInstance()
//     if (!instance) {
//         throw new Error('getCurrentTracking must be used during a component setup')
//     }
//
//     triggerRef(dispatchFn);
//     // const pendingDispatch = ref<Array<() => void> | false>(false);
//     //
//     // if (pendingDispatch.value) {
//     //     for (const fn of pendingDispatch.value) {
//     //         fn();
//     //     }
//     //     pendingDispatch.value = false;
//     // }
//     //
//     // return (...args: any[]) => {
//     //     if (isRendering.value) {
//     //         if (pendingDispatch.value) {
//     //             pendingDispatch.value.push(() => {
//     //                 if (isMounted.value) dispatchFn(...args);
//     //             });
//     //         }
//     //         pendingDispatch.value = [
//     //             () => {
//     //                 if (isMounted.value) dispatchFn(...args);
//     //             },
//     //         ];
//     //     } else if (isMounted.value) {
//     //         dispatchFn(...args);
//     //     }
//     // };
// }

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
  const buildSelections = (selectionsSet: Ref<Set<Selection>>) => {
    selectionsSet.value.clear();

    if (!argSelections) return;

    try {
      for (const filterValue of argSelections) {
        let selection: Selection | undefined;
        if (filterValue instanceof Selection) {
          selectionsSet.value.add(filterValue);
        } else if ((selection = getProxySelection(filterValue))) {
          selectionsSet.value.add(selection);
        }
      }
    } catch (err) {
      if (err instanceof Error && Error.captureStackTrace!) {
        Error.captureStackTrace(err, caller);
      }

      throw err;
    }
  };

  const selections = ref(new Set<Selection>());

  buildSelections(selections);

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

// function initSelectionsState() {
//     return ref(new Set<Selection>());
// }
//
// export function useSelectionsState() {
//     const [selections] = useState(initSelectionsState);
//
//     return selections;
// }

export function useSubscribeCacheChanges({
  hookSelections,
  eventHandler,
  onChange,
  shouldSubscribe = true,
}: {
  hookSelections: Ref<Set<Selection>>;
  eventHandler: EventHandler;
  onChange: () => void;
  shouldSubscribe?: boolean;
}) {
  let onChangeCalled = false;

  if (!shouldSubscribe) return;
  const unsubscribeFetch = eventHandler.onFetchSubscribe(
    (fetchPromise, promiseSelections) => {
      if (
        onChangeCalled ||
        !promiseSelections.some((selection) =>
          hookSelections.value.has(selection)
        )
      ) {
        return;
      }

      onChangeCalled = true;
      fetchPromise.then(
        () => {
          Promise.resolve(fetchPromise).then(onChange);
        },
        () => {}
      );
    }
  );
  const unsubscribeCache = eventHandler.onCacheChangeSubscribe(
    ({ selection }) => {
      if (!onChangeCalled && hookSelections.value.has(selection)) {
        onChangeCalled = true;
        Promise.resolve().then(onChange);
      }
    }
  );

  onUnmounted(() => {
    const instance = getCurrentInstance();
    if (instance) {
      unsubscribeFetch();
      unsubscribeCache();
    }
  });
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
  query,
  onError,
  updateOnFetchPromise,
}: {
  staleWhileRevalidate: boolean | object | number | string | null;
  interceptorManager: InterceptorManager;
  scheduler: Scheduler;
  eventHandler: EventHandler;
  query: Ref;
  onError: OnErrorHandler | undefined;
  updateOnFetchPromise?: boolean;
}) {
  const hookSelections = ref(new Set<Selection>());
  // const forceUpdate = useDeferDispatch(useForceUpdate());
  const fetchingPromise = ref<Promise<void> | null>(null);

  const interceptor = createInterceptor();

  const enabledStaleWhileRevalidate =
    hasEnabledStaleWhileRevalidate(staleWhileRevalidate);
  const cacheRefetchSelections = enabledStaleWhileRevalidate
    ? new Set<Selection>()
    : null;
  interceptor.selectionCacheRefetchListeners.add((selection) => {
    if (cacheRefetchSelections) cacheRefetchSelections.add(selection);

    hookSelections.value.add(selection);
  });

  if (enabledStaleWhileRevalidate && cacheRefetchSelections?.size) {
    for (const selection of cacheRefetchSelections) {
      globalInterceptor.addSelectionCacheRefetch(selection);
    }
  }
  interceptor.selectionAddListeners.add((selection) => {
    hookSelections.value.add(selection);
  });

  interceptor.selectionCacheListeners.add((selection) => {
    hookSelections.value.add(selection);
  });

  const deferredCall = ref<(() => void) | null>(null);

  if (deferredCall.value) {
    deferredCall.value();
    deferredCall.value = null;
  }
  // const isRendering = useIsRendering();

  const unsubscribeResolve = scheduler.subscribeResolve(
    (promise, selection) => {
      if (
        fetchingPromise.value === null &&
        deferredCall.value === null &&
        hookSelections.value.has(selection)
      ) {
        const newPromise = new Promise<void>((resolve) => {
          promise.then(({ error }) => {
            fetchingPromise.value = null;
            if (error && onError) onError(error);
            Promise.resolve().then(() => () => {
              triggerRef(query);
            });
            resolve();
          });
        });

        fetchingPromise.value = newPromise;

        if (updateOnFetchPromise) {
          if (enabledStaleWhileRevalidate) {
            deferredCall.value = () => triggerRef(query);
          } else {
            deferredCall.value = null;
            triggerRef(query);
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
    hookSelections,
    eventHandler,
    onChange() {
      if (!fetchingPromise.value) triggerRef(query);
    },
  });

  return { fetchingPromise, unsubscribe };
}

// export function useSuspensePromise(optsRef: {
//   current: { suspense?: boolean };
// }) {
//   let [promise, setPromiseState] = useState<Promise<unknown> | void>();
//
//   const isMounted = useIsMounted();
//
//   const setPromise = (newPromise, inlineThrow) => {
//       if (promise || !optsRef.value.suspense || !isMounted.value) return;
//
//       function clearPromise() {
//         if (isMounted.value) setPromiseState();
//       }
//
//       const promiseValue = (promise = newPromise.then(
//         clearPromise,
//         clearPromise
//       ));
//
//       setPromiseState(promiseValue);
//
//       if (inlineThrow) throw promiseValue;
//     }
//
//   if (promise) throw promise;
//
//   return setPromise;
// }

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

export const useIsWindowVisible = () => {
  const isVisible = ref(true);

  const onVisibilityChange = () => {
    isVisible.value = document.visibilityState === 'visible';
  };

  onVisibilityChange();

  document.addEventListener('visibilitychange', onVisibilityChange);

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', onVisibilityChange);
  });

  return isVisible;
};
