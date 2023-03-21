import { BaseGeneratedSchema, GQtyClient, GQtyError, RetryOptions } from 'gqty';
import * as React from 'react';
import {
  LegacyFetchPolicy,
  OnErrorHandler,
  translateFetchPolicy,
} from '../common';
import type { ReactClientOptionsWithDefaults } from '../utils';

export type LazyFetchPolicy = Exclude<LegacyFetchPolicy, 'cache-first'>;

export interface UseLazyQueryOptions<TData> {
  onCompleted?: (data: TData) => void;
  onError?: OnErrorHandler;
  fetchPolicy?: LazyFetchPolicy;
  retry?: RetryOptions;
  suspense?: boolean;
}

export interface UseLazyQueryState<TData> {
  data: TData | undefined;
  error?: GQtyError;
  isLoading: boolean;
  isCalled: boolean;
  promise?: Promise<TData>;
}

type UseLazyQueryReducerAction<TData> =
  | { type: 'cache-found'; data: TData }
  | { type: 'success'; data: TData }
  | { type: 'failure'; error: GQtyError }
  | { type: 'loading'; promise: Promise<TData> };

function UseLazyQueryReducer<TData>(
  state: UseLazyQueryState<TData>,
  action: UseLazyQueryReducerAction<TData>
): UseLazyQueryState<TData> {
  switch (action.type) {
    case 'loading': {
      if (state.isLoading) return state;
      return {
        data: state.data,
        isLoading: true,
        isCalled: true,
        promise: action.promise,
      };
    }
    case 'success': {
      return {
        data: action.data,
        isLoading: false,
        isCalled: true,
      };
    }
    case 'failure': {
      return {
        data: state.data,
        isLoading: false,
        error: action.error,
        isCalled: true,
      };
    }
    case 'cache-found': {
      return {
        data: action.data,
        isLoading: state.isLoading,
        isCalled: true,
      };
    }
  }
}

function InitUseLazyQueryReducer<TData>(): UseLazyQueryState<TData> {
  return {
    data: undefined,
    isLoading: false,
    isCalled: false,
  };
}

export interface UseLazyQuery<GeneratedSchema extends BaseGeneratedSchema> {
  <TData = unknown, TArgs = undefined>(
    queryFn: (query: GeneratedSchema['query'], args: TArgs) => TData,
    options?: UseLazyQueryOptions<TData>
  ): readonly [
    (
      ...opts: undefined extends TArgs
        ? [
            {
              fn?: (query: GeneratedSchema['query'], args: TArgs) => TData;
              args?: TArgs;
              fetchPolicy?: LazyFetchPolicy;
            }?
          ]
        : [
            {
              fn?: (query: GeneratedSchema['query'], args: TArgs) => TData;
              args: TArgs;
              fetchPolicy?: LazyFetchPolicy;
            }
          ]
    ) => Promise<TData>,
    UseLazyQueryState<TData>
  ];
}

export function createUseLazyQuery<TSchema extends BaseGeneratedSchema>(
  { resolve }: GQtyClient<TSchema>,
  {
    defaults: {
      retry: defaultRetry,
      lazyQuerySuspense: defaultSuspense,
      lazyFetchPolicy: defaultFetchPolicy,
    },
  }: ReactClientOptionsWithDefaults
) {
  const useLazyQuery: UseLazyQuery<TSchema> = (
    fn,
    {
      onCompleted,
      onError,
      fetchPolicy: hookDefaultFetchPolicy = defaultFetchPolicy,
      retry = defaultRetry,
      suspense = defaultSuspense,
    } = {}
  ) => {
    type TCallback = typeof fn;
    type TArgs = Parameters<TCallback>[1];
    type TData = ReturnType<TCallback>;
    type TCallbackArgs = {
      fn?: TCallback;
      args?: TArgs;
      fetchPolicy?: LazyFetchPolicy;
    };

    const [state, dispatch] = React.useReducer(
      UseLazyQueryReducer,
      undefined,
      InitUseLazyQueryReducer
    ) as [
      UseLazyQueryState<TData>,
      React.Dispatch<UseLazyQueryReducerAction<TData>>
    ];

    if (suspense) {
      if (state.promise) throw state.promise;
      if (state.error) throw state.error;
    }

    return React.useMemo(() => {
      const fetchQuery = async ({
        fn: resolveFn = fn,
        args,
        fetchPolicy = hookDefaultFetchPolicy,
      }: TCallbackArgs = {}) => {
        let innerFetchPromise: Promise<TData> | undefined;

        try {
          const fetchPromise = resolve(
            ({ query }) => resolveFn(query, args as TArgs),
            {
              awaitsFetch: false,
              fetchPolicy: translateFetchPolicy(fetchPolicy),
              onFetch(promise) {
                innerFetchPromise = promise as Promise<TData>;
              },
              retryPolicy: retry,
            }
          ).then((data) => {
            const typedData = data as TData;

            if (fetchPolicy === 'cache-and-network') {
              dispatch({ type: 'cache-found', data: typedData });
            }

            return innerFetchPromise ?? typedData;
          });

          dispatch({ type: 'loading', promise: fetchPromise });

          const data = await fetchPromise;

          onCompleted?.(data);
          dispatch({ type: 'success', data });

          return data;
        } catch (error) {
          const typedError = GQtyError.create(error);

          onError?.(typedError);
          dispatch({ type: 'failure', error: typedError });

          throw error;
        }
      };

      return Object.freeze([fetchQuery, state]);
    }, [fn, onCompleted, onError, retry]);
  };

  return useLazyQuery;
}
