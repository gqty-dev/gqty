import { usePrevious, useRerender, useUpdateEffect } from '@react-hookz/web';
import {
  BaseGeneratedSchema,
  GQtyClient,
  GQtyError,
  prepass,
  RetryOptions,
} from 'gqty';
import { useCallback, useEffect, useMemo } from 'react';
import {
  LegacyFetchPolicy,
  OnErrorHandler,
  translateFetchPolicy,
} from '../common';
import { useThrottledAsync } from '../useThrottledAsync';
import { useWindowFocusEffect } from '../useWindowFocusEffect';
import type { ReactClientOptionsWithDefaults } from '../utils';

export interface UseQueryPrepareHelpers<
  GeneratedSchema extends {
    query: object;
  }
> {
  readonly prepass: typeof prepass;
  readonly query: GeneratedSchema['query'];
}
export interface UseQueryOptions<TSchema extends BaseGeneratedSchema> {
  fetchPolicy?: LegacyFetchPolicy;
  notifyOnNetworkStatusChange?: boolean;
  onError?: OnErrorHandler;
  operationName?: string;
  prepare?: (helpers: UseQueryPrepareHelpers<TSchema>) => void;
  refetchOnWindowVisible?: boolean;
  retry?: RetryOptions;
  staleWhileRevalidate?: boolean | object | number | string | null;
  suspense?: boolean;
}

export interface UseQueryState {
  /**
   * Useful for `Non-Suspense` usage.
   */
  readonly isLoading: boolean;

  /**
   * Latest scheduler Error, for more in-depth error management use `useMetaState` hook
   */
  error?: GQtyError;
}

export type Writeable<T> = { -readonly [P in keyof T]: T[P] };

export type UseQueryReturnValue<GeneratedSchema extends { query: object }> =
  GeneratedSchema['query'] & {
    $state: UseQueryState;
    $refetch: () => Promise<unknown>;
  };
export interface UseQuery<GeneratedSchema extends { query: object }> {
  (
    options?: UseQueryOptions<GeneratedSchema>
  ): UseQueryReturnValue<GeneratedSchema>;
}

export const createUseQuery =
  <TSchema extends BaseGeneratedSchema>(
    client: GQtyClient<TSchema>,
    {
      defaults: {
        suspense: defaultSuspense,
        staleWhileRevalidate: defaultStaleWhileRevalidate,
        retry: defaultRetry,
      },
    }: ReactClientOptionsWithDefaults
  ): UseQuery<TSchema> =>
  ({
    fetchPolicy = 'cache-first',
    notifyOnNetworkStatusChange = true,
    onError,
    operationName,
    prepare,
    refetchOnWindowVisible = false,
    retry = defaultRetry,
    staleWhileRevalidate = defaultStaleWhileRevalidate,
    suspense = defaultSuspense,
  } = {}) => {
    const {
      accessor: { query },
      context,
      resolve,
      selections,
    } = useMemo(
      () =>
        client.createResolver({
          fetchPolicy: translateFetchPolicy(fetchPolicy),
          operationName,
          retryPolicy: retry,
        }),
      [fetchPolicy, operationName, retry]
    );

    const [{ status, error }, { execute }, { promise }] = useThrottledAsync(
      async () => {
        try {
          return await resolve();
        } catch (error) {
          const theError = GQtyError.create(error);

          onError?.(theError);

          throw theError;
        } finally {
          // Reset these, or createResolver() each time and deal with the new resolve.
          context.shouldFetch = false;
          context.hasCacheHit = false;
          context.hasCacheMiss = false;
        }
      }
    );

    if (suspense) {
      if (error) throw GQtyError.create(error);
      if (promise && status === 'loading') {
        throw promise;
      }
    }

    if (prepare) {
      // TODO: See if `Error.captureStackTrace(error, useQuery);` is needed
      prepare({ prepass, query });

      // Assuming the fetch always fulfills selections in prepare(), otherwise
      // this may cause an infinite render loop.
      if (suspense && context.shouldFetch) {
        throw resolve();
      }
    }

    const refetch = useCallback(
      (force = false) => {
        if (force) {
          context.shouldFetch = true;
        } else if (promise) {
          return promise;
        }

        const refetchPromise = execute();
        context.refechPromise = refetchPromise;

        refetchPromise.catch(console.error).finally(() => {
          context.refetchPromise = undefined;
        });

        return refetchPromise;
      },
      [execute, promise]
    );

    // Invoke it on client side automatically.
    useEffect(() => {
      if (context.shouldFetch) {
        refetch();
      }
    });

    // staleWhileRevalidate
    const swrDiff = usePrevious(staleWhileRevalidate);
    useUpdateEffect(() => {
      if (staleWhileRevalidate && !Object.is(staleWhileRevalidate, swrDiff)) {
        refetch(true);
      }
    }, [refetch, swrDiff]);

    {
      const render = useRerender();

      // A rerender should be enough to trigger a soft check, fetch will
      // happen if any of the accessed cache value is stale.
      useWindowFocusEffect(
        () => {
          refetch();
        },
        { enabled: refetchOnWindowVisible }
      );

      // Rerenders on cache changes from others
      useEffect(() => {
        if (selections.size === 0) return;

        return context.cache.subscribe(
          [...selections].map(({ cacheKeys }) => cacheKeys.join('.')),
          render
        );
      }, [selections, selections.size]);
    }

    return useMemo(() => {
      return new Proxy(
        Object.freeze({
          $refetch: (force = true) => refetch(force),
          $state: {
            isLoading:
              status === 'loading' &&
              (context.refetchPromise !== promise ||
                notifyOnNetworkStatusChange),
            error: GQtyError.create(error),
          },
        }),
        {
          get: (target, key, proxy) =>
            Reflect.get(target, key, proxy) ??
            Reflect.get(
              prepare
                ? // Using global schema accessor prevents the second pass fetch
                  // essentially let `prepare` decides what data to fetch, data
                  // placeholder will always render in case of a cache miss.
                  client.schema.query
                : query,
              key
            ),
        }
      );
    }, [query, refetch, status, error]);
  };
