import { BaseGeneratedSchema, GQtyClient, GQtyError, RetryOptions } from 'gqty';
import * as React from 'react';
import {
  coreHelpers,
  LegacyFetchPolicy,
  sortBy,
  translateFetchPolicy,
  uniqBy,
} from '../common';
import type { ReactClientOptionsWithDefaults } from '../utils';

export type PaginatedQueryFetchPolicy = Extract<
  LegacyFetchPolicy,
  'cache-first' | 'cache-and-network' | 'network-only'
>;

export interface UsePaginatedQueryMergeParams<TData> {
  data: {
    existing: TData | undefined;
    incoming: TData;
  };
  uniqBy: typeof uniqBy;
  sortBy: typeof sortBy;
}

export interface UsePaginatedQueryOptions<TData, TArgs> {
  /**
   * Initial arguments used on first request
   */
  initialArgs: TArgs;
  /**
   * Custom merge function
   */
  merge?: (
    params: UsePaginatedQueryMergeParams<TData>
  ) => TData | undefined | void;
  /**
   * Fetch Policy behavior
   *
   * If using `cache-and-network` and `merge`, we recomend using the `uniqBy`
   * helper included inside the `merge` parameters.
   */
  fetchPolicy?: PaginatedQueryFetchPolicy;
  operationName?: string;
  retry?: RetryOptions;
  /**
   * Skip initial query call
   *
   * @default false
   */
  skip?: boolean;
  /**
   * Activate suspense on first call
   */
  suspense?: boolean;
}

export interface UsePaginatedQueryData<TData, TArgs> {
  /**
   * Query Data
   */
  data: TData | undefined;
  /**
   * Current arguments used in the query
   */
  args: TArgs;
  /**
   * Network fetch is loading
   */
  isLoading: boolean;
  /**
   * Main function to be used
   *
   * If new args are not specified, the previous or initial args are used
   *
   * In the second parameter you can override the `"fetchPolicy"`, for example
   * you can set it to `"network-only"` to do a refetch.
   */
  fetchMore: (
    /**
     * Optional new args. It can receive a function that receives the previous
     * data/args and returns the new args, or the new args directly
     *
     * If not specified or `undefined`, the previous or initial args are used.
     */
    newArgs?:
      | ((data: FetchMoreCallbackArgs<TData, TArgs>) => TArgs)
      | TArgs
      | undefined,
    /**
     * Override hook fetchPolicy
     */
    fetchPolicy?: PaginatedQueryFetchPolicy
  ) => Promise<TData> | TData;
}

export interface FetchMoreCallbackArgs<TData, TArgs> {
  existingData: TData | undefined;
  existingArgs: TArgs;
}

export interface UsePaginatedQuery<TSchema extends BaseGeneratedSchema> {
  <TData, TArgs extends Record<string, any> | string | number | null>(
    fn: (
      query: TSchema['query'],
      args: TArgs,
      helpers: typeof coreHelpers
    ) => TData,
    options: UsePaginatedQueryOptions<TData, TArgs>
  ): UsePaginatedQueryData<TData, TArgs>;
}

export const createUsePaginatedQuery =
  <TSchema extends BaseGeneratedSchema>(
    { createResolver }: GQtyClient<TSchema>,
    {
      defaults: {
        paginatedQueryFetchPolicy: defaultFetchPolicy,
        paginatedQuerySuspense: defaultSuspense,
      },
    }: ReactClientOptionsWithDefaults
  ): UsePaginatedQuery<TSchema> =>
  (
    fn,
    {
      initialArgs,
      fetchPolicy: hookFetchPolicy = defaultFetchPolicy,
      merge,
      retry,
      skip = false,
      suspense = defaultSuspense,
      operationName,
    }
  ) => {
    type TCallback = typeof fn;
    type TArgs = Parameters<TCallback>[1];
    type TData = ReturnType<TCallback>;

    const {
      accessor: { query },
      context,
      resolve,
      selections,
    } = React.useMemo(
      () =>
        createResolver({
          fetchPolicy: translateFetchPolicy(hookFetchPolicy),
          operationName,
          retryPolicy: retry,
        }),
      [hookFetchPolicy, operationName, retry]
    );

    const [fetchPromise, setFetchPromise] = React.useState<Promise<TData>>();
    const [error, setError] = React.useState<GQtyError>();
    const [data, setData] = React.useState<TData>();
    const [args, setArgs] = React.useState(initialArgs);

    if (suspense) {
      if (fetchPromise) throw fetchPromise;
      if (error) throw error;
    }

    const fetchMore = React.useCallback(
      async (
        newArgs?:
          | ((data: FetchMoreCallbackArgs<TData, TArgs>) => TArgs)
          | TArgs,
        fetchPolicy: PaginatedQueryFetchPolicy = hookFetchPolicy
      ) => {
        setError(undefined);
        setFetchPromise(undefined);
        selections.clear();

        {
          const data = dataFn();

          if (!context.shouldFetch) {
            const mergedData = mergeData(data);
            setData(mergedData);
            return mergedData;
          }

          if (fetchPolicy === 'cache-and-network' && context.hasCacheHit) {
            setData(mergeData(data));
          }
        }

        const promise = resolve().then(dataFn);

        setFetchPromise(promise);

        try {
          const currentData = mergeData(await promise);

          setData(currentData);

          return currentData;
        } catch (error) {
          const theError = GQtyError.create(error);

          setError(theError);

          throw theError;
        }

        function dataFn() {
          const newArgsValue =
            typeof newArgs === 'function'
              ? newArgs({ existingData: data, existingArgs: args })
              : newArgs;

          setArgs(newArgsValue);

          return fn(query, newArgsValue, coreHelpers);
        }

        function mergeData(incomingData: TData) {
          return (
            merge?.({
              data: {
                incoming: incomingData,
                existing: data,
              },
              uniqBy,
              sortBy,
            }) ?? incomingData
          );
        }
      },
      [context, fn, hookFetchPolicy, data, args]
    );

    // Invoke fetchMore once with initialArgs
    React.useEffect(() => {
      if (!skip) fetchMore(initialArgs);
    }, [skip, fetchMore, initialArgs]);

    // Subscribe to cache change
    React.useEffect(() => {
      return context.cache.subscribe(
        [...selections].map((s) => s.cacheKeys.join('.')),
        () => {
          setData(fn(query, args, coreHelpers));
        }
      );
    }, [fn, args, selections.size]);

    return React.useMemo(
      () => ({ data, args, fetchMore, isLoading: fetchPromise === undefined }),
      [data, args, fetchMore, fetchPromise]
    );
  };
