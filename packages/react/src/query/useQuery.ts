import {
  useDebouncedCallback,
  useIntervalEffect,
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
import { useOnlineEffect } from '../useOnlineEffect';
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
  cachePolicy?: RequestCache;
  fetchPolicy?: LegacyFetchPolicy;
  notifyOnNetworkStatusChange?: boolean;
  onError?: OnErrorHandler;
  operationName?: string;
  prepare?: (helpers: UseQueryPrepareHelpers<TSchema>) => void;
  refetchInterval?: number;
  refetchIntervalInBackground?: boolean;
  refetchOnReconnect?: boolean;
  refetchOnWindowVisible?: boolean;
  retry?: RetryOptions;
  retryPolicy?: RetryOptions;
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
    cachePolicy = translateFetchPolicy(fetchPolicy),
    notifyOnNetworkStatusChange = true,
    onError,
    operationName,
    prepare,
    refetchInterval,
    refetchIntervalInBackground,
    refetchOnReconnect = true,
    refetchOnWindowVisible = true,
    retry = defaultRetry,
    retryPolicy = retry,
    staleWhileRevalidate = defaultStaleWhileRevalidate,
    suspense = defaultSuspense,
  } = {}) => {
    const render = useRerender();
    const debouncedRender = useDebouncedCallback(render, [render], 50);
    const {
      accessor: { query },
      context,
      resolve,
      subscribe,
      selections,
    } = useMemo(
      () =>
        client.createResolver({
          cachePolicy,
          operationName,
          retryPolicy,
        }),
      [cachePolicy, operationName, retryPolicy]
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
          cachePolicy,
          operationName,
          retryPolicy,
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

      if (context.shouldFetch) {
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
          context.notifyCacheUpdate = cachePolicy !== 'default';

          setState({});
          resolve();
        },
      });
    }, [cachePolicy, context.shouldFetch]);

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
          context.notifyCacheUpdate = cachePolicy !== 'default';

          setState({});
        }
      },
      [cachePolicy, context.shouldFetch, operationName, selections]
    );

    // Legacy staleWhileRevalidate
    const swrDiff = usePrevious(staleWhileRevalidate);
    useUpdateEffect(() => {
      if (staleWhileRevalidate && !Object.is(staleWhileRevalidate, swrDiff)) {
        refetch(true);
      }
    }, [refetch, swrDiff]);

    // refetchInterval
    useIntervalEffect(() => {
      if (
        !refetchIntervalInBackground &&
        globalThis.document?.visibilityState !== 'visible'
      )
        return;

      debouncedRender();
    }, refetchInterval);

    // refetchOnReconnect
    useOnlineEffect(() => {
      if (refetchOnReconnect) debouncedRender();
    }, [debouncedRender, refetchOnReconnect]);

    // A rerender should be enough to trigger a soft check, fetch will
    // happen if any of the accessed cache value is stale.
    useWindowFocusEffect(debouncedRender, {
      enabled: refetchOnWindowVisible,
    });

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
              prepare && cachePolicy !== 'no-store'
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
