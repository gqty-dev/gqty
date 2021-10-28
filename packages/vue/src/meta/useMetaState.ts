import type { GQtyClient, GQtyError, Selection } from 'gqty';
import type { SchedulerPromiseValue } from 'gqty/Scheduler';
// import { useCallback, useEffect, useRef, useState } from 'react';
import { getCurrentInstance, onUnmounted, ref } from 'vue-demi';
import type { Ref } from 'vue-demi';

import {
  BuildSelections,
  isAnySelectionIncluded,
  isAnySelectionIncludedInMatrix,
  isSelectionIncluded,
  useBuildSelections,
} from '../common';

// import { areArraysEqual } from '../utils';

export interface UseMetaStateOptions<T> {
  onStartFetching?: () => void;
  onDoneFetching?: () => void;
  onError?: (data: {
    newError: GQtyError;
    selections: Selection[];
    isLastTry: boolean;
  }) => void;
  onRetry?: (data: {
    retryPromise: Promise<SchedulerPromiseValue>;
    selections: Set<Selection>;
  }) => void;
  filterSelections?: BuildSelections<T>;
}

export interface MetaState {
  isFetching: Ref<boolean>;
  errors: Ref<GQtyError[] | undefined>;
}

export interface UseMetaState {
  <T>(opts?: UseMetaStateOptions<T>): MetaState;
}

export function createUseMetaState(client: GQtyClient<any>) {
  const scheduler = client.scheduler;

  const {
    accessorCache: { getProxySelection },
  } = client;

  const errorsMap = scheduler.errors.map;

  const defaultEmptyOpts = {};

  const useMetaState: UseMetaState = function useMetaState(
    opts: UseMetaStateOptions<any> = defaultEmptyOpts
  ) {
    const {
      hasSpecifiedSelections: hasFilterSelections,
      selections: selectionsToFilter,
    } = useBuildSelections(
      opts.filterSelections,
      getProxySelection,
      useMetaState
    );

    const instance = getCurrentInstance();

    if (!instance) {
      throw new Error(
        'getCurrentTracking must be used during a component setup'
      );
    }

    const promisesInFly = ref(new Set<Promise<unknown>>());
    const isFetching = ref(false) as Ref<boolean>;

    if (scheduler.pendingSelectionsGroups.size) {
      if (hasFilterSelections) {
        isFetching.value = isAnySelectionIncludedInMatrix(
          selectionsToFilter.value,
          scheduler.pendingSelectionsGroups
        );
      } else {
        isFetching.value = true;
      }

      if (isFetching && scheduler.pendingSelectionsGroupsPromises.size) {
        Promise.all(scheduler.pendingSelectionsGroupsPromises.values());
        // ).finally(() => setStateIfChanged(isMounted));
      }
    } else {
      isFetching.value = false;
    }

    const errors = ref(undefined) as Ref<GQtyError[] | undefined>;

    if (hasFilterSelections) {
      const errorsSet = new Set<GQtyError>();

      selectionsToFilter.value.forEach((selection: Selection) => {
        const error = errorsMap.get(selection);

        if (error) errorsSet.add(error);
      });

      if (errorsSet.size) errors.value = Array.from(errorsSet);
    } else if (errorsMap.size) {
      errors.value = Array.from(new Set(errorsMap.values()));
    }

    // const setStateIfChanged = function setStateIfChanged(isMounted: {
    //     current: boolean;
    // }) {
    //     if (!isMounted.value) return;
    //
    //     const prevState = stateRef.value;
    //
    //     const newState = getState(isMounted);
    //
    //     if (
    //         prevState.isFetching !== newState.isFetching ||
    //         !areArraysEqual(prevState.errors, newState.errors)
    //     ) {
    //         stateRef.value = newState;
    //         setTimeout(() => {
    //             if (isMounted.value) setState(newState);
    //         }, 0);
    //     }
    // };

    // const [state, setState] = useState(getState);

    // const stateRef = useRef(state);
    // stateRef.value = state;
    //
    const optsRef = ref(opts);
    // optsRef.value = opts;

    // useIsomorphicLayoutEffect(() => {
    //     const isMounted = { current: true };

    const unsubscribeIsFetching = scheduler.subscribeResolve(
      (promise, selection) => {
        if (promisesInFly.value.has(promise)) return;

        if (
          hasFilterSelections &&
          !isSelectionIncluded(selection, selectionsToFilter.value)
        ) {
          return;
        }

        if (promisesInFly.value.size === 0) optsRef.value.onStartFetching?.();

        promisesInFly.value.add(promise);

        // setStateIfChanged(isMounted);

        promise.then(() => {
          promisesInFly.value.delete(promise);

          if (promisesInFly.value.size === 0) optsRef.value.onDoneFetching?.();

          // setStateIfChanged(isMounted);
        });
      }
    );

    const unsubscribeErrors = scheduler.errors.subscribeErrors((data) => {
      console.log('error subscripton: ', data);
      switch (data.type) {
        case 'new_error': {
          if (hasFilterSelections) {
            if (
              isAnySelectionIncluded(selectionsToFilter.value, data.selections)
            )
              optsRef.value.onError?.({
                newError: data.newError,
                selections: data.selections,
                isLastTry: data.isLastTry,
              });
            else return;
          } else {
            optsRef.value.onError?.({
              newError: data.newError,
              selections: data.selections,
              isLastTry: data.isLastTry,
            });
          }
          break;
        }
        case 'retry': {
          if (hasFilterSelections) {
            if (
              isAnySelectionIncluded(selectionsToFilter.value, data.selections)
            ) {
              optsRef.value.onRetry?.({
                retryPromise: data.retryPromise,
                selections: data.selections,
              });
              data.retryPromise.finally(() => {
                setTimeout(() => {
                  console.log('ODE: finally!!');
                  // setStateIfChanged(isMounted);
                }, 0);
              });
            }
          } else {
            optsRef.value.onRetry?.({
              retryPromise: data.retryPromise,
              selections: data.selections,
            });
            data.retryPromise.finally(() => {
              setTimeout(() => {
                console.log('ODE: finally!!');
                // setStateIfChanged(isMounted);
              }, 0);
            });
          }
          break;
        }
        case 'errors_clean': {
        }
      }

      // setStateIfChanged(isMounted);
    });

    onUnmounted(() => {
      const instance = getCurrentInstance();
      if (instance) {
        unsubscribeIsFetching();
        unsubscribeErrors();
      }
    });

    //     return () => {
    //         isMounted.value = false;
    //         unsubscribeIsFetching();
    //         unsubscribeErrors();
    //     };
    // }, [getState, hasFilterSelections, setState, optsRef, selectionsToFilter]);
    //
    // return state;
    // };
    return { errors, isFetching };
  };

  return useMetaState;
}
