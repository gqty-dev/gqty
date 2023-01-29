import {
  doRetry,
  GQtyClient,
  GQtyError,
  RetryOptions,
  SelectionType,
} from 'gqty';
import * as React from 'react';
import { useIsomorphicLayoutEffect, useSelectionsState } from '../common';
import type { ReactClientOptionsWithDefaults } from '../utils';

interface UseRefetchState {
  isLoading: boolean;
  error?: GQtyError;
}

type UseRefetchReducerAction =
  | { type: 'loading' }
  | { type: 'done' }
  | { type: 'error'; error: GQtyError };

function UseRefetchReducer(
  state: UseRefetchState,
  action: UseRefetchReducerAction
): UseRefetchState {
  switch (action.type) {
    case 'loading': {
      if (state.isLoading) return state;

      return { isLoading: true };
    }
    case 'done': {
      return { isLoading: false };
    }
    case 'error': {
      return { isLoading: false, error: action.error };
    }
  }
}

export interface UseRefetchOptions {
  notifyOnNetworkStatusChange?: boolean;
  startWatching?: boolean;
  retry?: RetryOptions;
}

export interface UseRefetch {
  (refetchOptions?: UseRefetchOptions): (<T = void>(
    refetchArg?: T | (() => T)
  ) => Promise<T | undefined>) &
    UseRefetchState;
}

export function createUseRefetch(
  client: GQtyClient<any>,
  { defaults: { retry: defaultRetry } }: ReactClientOptionsWithDefaults
) {
  const { interceptorManager, buildAndFetchSelections, refetch } = client;

  const useRefetch: UseRefetch = function useRefetch(
    refetchOptions
  ): (<T = undefined>(refetchArg?: T | (() => T)) => Promise<T | undefined>) &
    UseRefetchState {
    const [options] = React.useState(() => ({
      notifyOnNetworkStatusChange: true,
      startWatching: true,
      retry: defaultRetry,
      ...refetchOptions,
    }));

    const [innerState] = React.useState(() => ({
      watching: options.startWatching,
      startWatching() {
        this.watching = true;
      },
      stopWatching() {
        this.watching = false;
      },
    }));

    const selections = useSelectionsState();
    const [state, dispatch] = React.useReducer(
      UseRefetchReducer,
      undefined,
      () => ({ isLoading: false })
    );

    const interceptor = interceptorManager.createInterceptor();

    setTimeout(() => {
      interceptorManager.removeInterceptor(interceptor);
    }, 0);

    useIsomorphicLayoutEffect(() => {
      interceptorManager.removeInterceptor(interceptor);
    });

    interceptor.selectionAddListeners.add((selection) => {
      if (!innerState.watching) return;

      selections.add(selection);
    });

    interceptor.selectionCacheListeners.add((selection) => {
      if (!innerState.watching) return;

      selections.add(selection);
    });

    const refetchCallback = React.useCallback(
      async <T = undefined>(
        proxyOrFn?: T | (() => T)
      ): Promise<T | undefined> => {
        if (options.notifyOnNetworkStatusChange) {
          dispatch({ type: 'loading' });
        }

        try {
          const refetchData = proxyOrFn
            ? await refetch(proxyOrFn)
            : await (async () => {
                const selectionsToRefetch = Array.from(selections).filter(
                  (v) => v.type === SelectionType.Query
                );
                if (
                  process.env.NODE_ENV !== 'production' &&
                  selectionsToRefetch.length === 0
                ) {
                  console.warn('Warning! No selections available to refetch!');
                }

                return buildAndFetchSelections<T>(selectionsToRefetch, 'query');
              })();

          dispatch({ type: 'done' });

          return refetchData;
        } catch (err) {
          const error = GQtyError.create(err, useRefetch);

          dispatch({ type: 'error', error });

          throw error;
        }
      },
      [selections, dispatch, options]
    );

    const { retry } = options;

    return React.useMemo(() => {
      const fn = refetchCallback.bind(undefined);
      const returnValue: ReturnType<UseRefetch> = Object.assign(
        retry
          ? async (...args: any[]): Promise<any> => {
              try {
                return await fn(...args);
              } catch (err) {
                doRetry(retry, { onRetry: () => fn(...args) });
                throw err;
              }
            }
          : fn,
        state
      );

      return returnValue;
    }, [refetchCallback, state, retry]);
  };

  return useRefetch;
}
