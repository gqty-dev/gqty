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
    { createResolver, resolve }: GQtyClient<TSchema>,
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

    // Debounce to skip one render on mount, when the cache is already fresh.
    const [state, setState] = React.useState<{
      data?: TData;
      args: TArgs;
      promise?: Promise<TData>;
      error?: GQtyError;
    }>({
      args: initialArgs,
    });

    if (suspense) {
      if (state.promise) throw state.promise;
      if (state.error) throw state.error;
    }

    const mergeData = React.useCallback(
      (incoming: TData) =>
        merge?.({
          data: {
            existing: state.data,
            incoming,
          },
          uniqBy,
          sortBy,
        }) ?? incoming,
      [merge]
    );

    const fetchData = React.useCallback(
      async (
        args: TArgs,
        fetchPolicy: PaginatedQueryFetchPolicy = hookFetchPolicy
      ) => {
        const promise = resolve(({ query }) => fn(query, args, coreHelpers), {
          fetchPolicy: translateFetchPolicy(fetchPolicy),
          operationName,
          retryPolicy: retry,
          onSelect(selection, cache) {
            context.onSelect(selection, cache);
          },
        }) as Promise<TData>;

        if (!context.shouldFetch) {
          state.data = mergeData(fn(query, args, coreHelpers));

          return state.data;
        }

        if (hookFetchPolicy === 'cache-and-network' && context.hasCacheHit) {
          state.data = mergeData(fn(query, args, coreHelpers));
        }

        state.promise = promise;

        promise.finally(() => {
          if (state.promise === promise) {
            state.promise = undefined;
          }
        });

        return promise;
      },
      [
        context,
        coreHelpers,
        fn, // fn almost guaranteed to change on every render
        hookFetchPolicy,
        mergeData,
        operationName,
        query,
        retry,
      ]
    );

    // Call it once on first render
    React.useState(() => {
      if (skip) return setState(({ args }) => ({ args }));

      const promise = fetchData(initialArgs);

      promise
        .then(
          (data) => {
            setTimeout(() => {
              setState(({ args }) => ({ args, data }));
            }, 1000);
          },
          (error) => {
            setState(({ args }) => ({
              args,
              error: GQtyError.create(error),
            }));
          }
        )
        .finally(() => {
          context.shouldFetch = false;
        });

      if (context.shouldFetch) {
        if (suspense) {
          throw promise;
        } else {
          setState(({ args }) => ({ args, promise }));
        }
      }
    });

    // Re-render when normalized objects are updated, also resubscribe on
    // selection change to pick up newly fetched normalized objects.
    React.useEffect(() => {
      if (skip || selections.size === 0) return;

      return context.cache.subscribe(
        [...selections].map((s) => s.cacheKeys.join('.')),
        () => setState((state) => ({ ...state }))
      );
    }, [selections.size]);

    const fetchMore = React.useCallback(
      async (
        newArgs?:
          | ((data: FetchMoreCallbackArgs<TData, TArgs>) => TArgs)
          | TArgs,
        fetchPolicy?: PaginatedQueryFetchPolicy
      ) => {
        const currentArgs =
          typeof newArgs === 'function'
            ? newArgs({ existingData: state.data, existingArgs: state.args })
            : newArgs ?? state.args;

        try {
          const promise = fetchData(currentArgs, fetchPolicy);
          // setState((state) => ({ ...state, promise }));

          const data = await promise.then(mergeData);
          setState(({ args }) => ({ args, data }));

          return data;
        } catch (e) {
          const error = GQtyError.create(e);
          setState(({ args }) => ({ args, error }));

          throw error;
        }
      },
      [fetchData]
    );

    // Subscribe to cache change
    React.useEffect(() => {
      return context.cache.subscribe(
        [...selections].map((s) => s.cacheKeys.join('.')),
        () => {
          setState((state) => ({
            ...state,
            data: fn(query, state.args, coreHelpers),
          }));
        }
      );
    }, [fn, state, selections.size]);

    return React.useMemo(
      () =>
        Object.freeze({
          args: state.args,
          data: state.data,
          fetchMore,
          isLoading: state.promise !== undefined,
        }),
      [state.args, state.data, fetchMore, state.promise]
    );
  };
