import {
  useDebouncedCallback,
  usePrevious,
  useRerender,
  useThrottledState,
  useUpdateEffect,
} from '@react-hookz/web';
import {
  BaseGeneratedSchema,
  GQtyClient,
  GQtyError,
  prepass,
  RetryOptions,
} from 'gqty';
import pDefer from 'p-defer';
import { useCallback, useEffect, useMemo } from 'react';
import {
  LegacyFetchPolicy,
  OnErrorHandler,
  translateFetchPolicy,
} from '../common';
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
    const render = useRerender();
    const debouncedRender = useDebouncedCallback(render, [render], 50);
    const cacheMode = useMemo(
      () => translateFetchPolicy(fetchPolicy),
      [fetchPolicy]
    );
    const {
      accessor: { query },
      context,
      resolve,
      subscribe,
      selections,
    } = useMemo(
      () =>
        client.createResolver({
          cachePolicy: cacheMode,
          operationName,
          retryPolicy: retry,
        }),
      [fetchPolicy, operationName, retry]
    );

    const [state, setState] = useThrottledState<{
      error?: GQtyError;
      promise?: Promise<unknown>;
    }>({}, 50);

    // With `prepare`, selections are only collected within the provided
    // function. Accessing other properties in the proxy should not trigger
    // further fetches.
    if (prepare) {
      context.shouldFetch = false;

      prepare({ prepass, query });

      // When using prepare with suspense, the promise should be thrown
      // immediately.
      if (context.shouldFetch && suspense) {
        throw client.resolve(({ query }) => prepare({ prepass, query }), {
          cachePolicy: cacheMode,
          operationName,
          retryPolicy: retry,
        });
      }
    }

    if (suspense) {
      if (state.error) throw state.error;

      // Prevents excessive suspense fallback, throws only on empty cache.
      if (state.promise && !context.hasCacheHit) throw state.promise;
    }

    // Normal fetch
    useEffect(() => {
      if (state.promise !== undefined) return;

      const { resolve, reject, promise } = pDefer();

      if (context.shouldFetch && notifyOnNetworkStatusChange) {
        setState({ promise });
      }

      return subscribe({
        onNext: () => debouncedRender(),
        onError(error) {
          const theError = GQtyError.create(error);

          onError?.(theError);
          setState({ error: theError });
          reject(theError);
        },
        onComplete() {
          context.shouldFetch = false;
          context.hasCacheHit = false;
          context.hasCacheMiss = false;
          context.notifyCacheUpdate = cacheMode !== 'default';

          setState({});
          resolve();
        },
      });
    }, [context.shouldFetch]);

    const refetch = useCallback(
      async (force = false) => {
        if (!force && !context.shouldFetch) return;
        if (state.promise !== undefined) return;

        try {
          context.notifyCacheUpdate = true;
          context.shouldFetch = true;

          const promise = resolve();

          if (notifyOnNetworkStatusChange) {
            setState({ promise });
          }

          await promise;
        } catch (e) {
          const error = GQtyError.create(e);

          onError?.(error);
          setState({ error });
        } finally {
          context.shouldFetch = false;
          context.hasCacheHit = false;
          context.hasCacheMiss = false;
          context.notifyCacheUpdate = cacheMode !== 'default';

          setState({});
        }
      },
      [context.shouldFetch, operationName, selections]
    );

    // staleWhileRevalidate
    const swrDiff = usePrevious(staleWhileRevalidate);
    useUpdateEffect(() => {
      if (staleWhileRevalidate && !Object.is(staleWhileRevalidate, swrDiff)) {
        refetch(true);
      }
    }, [refetch, swrDiff]);

    {
      // A rerender should be enough to trigger a soft check, fetch will
      // happen if any of the accessed cache value is stale.
      useWindowFocusEffect(debouncedRender, {
        enabled: refetchOnWindowVisible,
      });
    }

    return useMemo(() => {
      return new Proxy(
        Object.freeze({
          $refetch: (force = true) => refetch(force),
          $state: Object.freeze({
            isLoading: state.promise !== undefined,
            error: state.error,
          }),
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
    }, [query, refetch, state]);
  };
