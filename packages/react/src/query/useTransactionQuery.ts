import {
  useDeepCompareEffect,
  useDocumentVisibility,
  useIntervalEffect,
} from '@react-hookz/web';
import {
  $meta,
  BaseGeneratedSchema,
  GQtyClient,
  GQtyError,
  RetryOptions,
  Selection,
} from 'gqty';
import * as React from 'react';

import {
  LegacyFetchPolicy,
  OnErrorHandler,
  translateFetchPolicy,
} from '../common';
import type { ReactClientOptionsWithDefaults } from '../utils';

export interface UseTransactionQueryState<TData> {
  data: TData | undefined;
  error?: GQtyError;
  isCalled: boolean;
  promise?: Promise<TData>;
}

type UseTransactionQueryReducerAction<TData> =
  | { type: 'cache-found'; data: TData }
  | { type: 'success'; data: TData }
  | { type: 'failure'; error: GQtyError }
  | { type: 'loading'; promise: Promise<TData> }
  | { type: 'skipped' };

function UseTransactionQueryReducer<TData>(
  state: UseTransactionQueryState<TData>,
  action: UseTransactionQueryReducerAction<TData>
): UseTransactionQueryState<TData> {
  switch (action.type) {
    case 'loading': {
      if (state.promise === action.promise) return state;

      return {
        data: state.data,
        isCalled: true,
        promise: action.promise,
      };
    }
    case 'success': {
      return {
        data: action.data,
        isCalled: true,
      };
    }
    case 'cache-found': {
      return {
        data: action.data,
        isCalled: true,
        promise: state.promise,
      };
    }
    case 'failure': {
      return {
        data: state.data,
        error: action.error,
        isCalled: true,
      };
    }
    case 'skipped': {
      if (!state.promise) return state;

      return {
        data: state.data,
        isCalled: true,
      };
    }
  }
}

function InitUseTransactionQueryReducer<
  TData
>(): UseTransactionQueryState<TData> {
  return {
    data: undefined,
    isCalled: false,
  };
}

export type UseTransactionQueryOptions<TData, TVariables> = {
  fetchPolicy?: LegacyFetchPolicy;
  skip?: boolean;
  /**
   * Frequency in milliseconds of polling/refetch of the query
   */
  pollInterval?: number;
  /**
   * If it should do polling while on background
   *
   * @default false
   */
  pollInBackground?: boolean;
  notifyOnNetworkStatusChange?: boolean;
  variables?: TVariables;
  onCompleted?: (data: TData) => void;
  onError?: OnErrorHandler;
  retry?: RetryOptions;
  suspense?: boolean;
  operationName?: string;
};

export interface UseTransactionQuery<TSchema extends BaseGeneratedSchema> {
  <TData, TVariables = undefined>(
    fn: (query: TSchema['query'], variables?: TVariables) => TData,
    queryOptions?: UseTransactionQueryOptions<TData, TVariables>
  ): UseTransactionQueryState<TData>;
}

export function createUseTransactionQuery<TSchema extends BaseGeneratedSchema>(
  client: GQtyClient<TSchema>,
  {
    defaults: {
      transactionFetchPolicy: defaultFetchPolicy,
      retry: defaultRetry,
      transactionQuerySuspense: defaultSuspense,
    },
  }: ReactClientOptionsWithDefaults
) {
  const useTransactionQuery: UseTransactionQuery<TSchema> = (
    fn,
    {
      fetchPolicy = defaultFetchPolicy,
      notifyOnNetworkStatusChange = true,
      onCompleted,
      onError,
      operationName,
      pollInBackground = false,
      pollInterval,
      retry = defaultRetry,
      skip = false,
      suspense = defaultSuspense,
      variables,
    } = {}
  ) => {
    type TCallback = typeof fn;
    type TData = ReturnType<TCallback>;

    const [state, dispatch] = React.useReducer(
      UseTransactionQueryReducer,
      undefined,
      InitUseTransactionQueryReducer
    ) as [
      UseTransactionQueryState<TData>,
      React.Dispatch<UseTransactionQueryReducerAction<TData>>
    ];

    useDeepCompareEffect(async () => {
      if (skip) {
        return dispatch({ type: 'skipped' });
      }

      const selections = new Set<Selection>();

      let fetchPromise: Promise<TData> | undefined;

      const promise = client.resolve(({ query }) => fn(query, variables), {
        awaitsFetch: false,
        fetchPolicy: translateFetchPolicy(fetchPolicy),
        onFetch(promise) {
          fetchPromise = promise as Promise<TData>;
        },
        onSelect(selection) {
          selections.add(selection);
        },
        operationName,
        retryPolicy: retry,
      }) as Promise<TData>;

      dispatch({ type: 'loading', promise });

      try {
        const cacheResult = await promise;

        if (fetchPromise === undefined) {
          dispatch({ type: 'success', data: cacheResult });
        } else {
          if (fetchPolicy === 'cache-and-network') {
            dispatch({ type: 'cache-found', data: cacheResult });
          }

          const fetchResult = await fetchPromise;

          onCompleted?.(fetchResult);
          dispatch({ type: 'success', data: fetchResult });
        }
      } catch (error) {
        const theError = GQtyError.create(error);

        onError?.(theError);
        dispatch({ type: 'failure', error: theError });
      }

      if (fetchPolicy !== 'no-cache') {
        return $meta(client.schema.query)?.context.cache.subscribe(
          [...selections].map((s) => s.cacheKeys.join('.')),
          () => {
            dispatch({
              type: 'success',
              data: fn(client.schema.query, variables),
            });
          }
        );
      }
    }, [fn, skip, variables]);

    if (suspense) {
      if (state.promise) throw state.promise;
      if (state.error) throw state.error;
    }

    const visible = useDocumentVisibility();

    // Polling won't fire onComplete and onError callbacks, it only updates
    // the component state.
    useIntervalEffect(async () => {
      if (skip || state.promise || (!visible && !pollInBackground)) return;

      const promise = client.resolve(({ query }) => fn(query, variables), {
        fetchPolicy: translateFetchPolicy(fetchPolicy),
        operationName,
        retryPolicy: retry,
      }) as Promise<TData>;

      if (notifyOnNetworkStatusChange) {
        dispatch({ type: 'loading', promise });
      }

      try {
        dispatch({ type: 'success', data: await promise });
      } catch (error) {
        dispatch({ type: 'failure', error: GQtyError.create(error) });
      }
    }, pollInterval);

    return state;
  };

  return useTransactionQuery;
}

// TODO: Test all use cases to make sure state changes are intact.
// TODO: Test if it can pick up changes to scope variables here, test `skip` and `pollInBackground`.
