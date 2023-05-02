import {
  useDebouncedCallback,
  useIntervalEffect,
  usePrevious,
  useRerender,
  useUpdateEffect,
} from '@react-hookz/web';
import {
  GQtyError,
  prepass,
  type BaseGeneratedSchema,
  type GQtyClient,
  type RetryOptions,
} from 'gqty';
import { MultiDict } from 'multidict';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  translateFetchPolicy,
  type LegacyFetchPolicy,
  type OnErrorHandler,
} from '../common';
import { useIsRendering } from '../useIsRendering';
import { useOnlineEffect } from '../useOnlineEffect';
import { useWindowFocusEffect } from '../useWindowFocusEffect';
import { type ReactClientOptionsWithDefaults } from '../utils';

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
  extensions?: Record<string, any>;
  fetchInBackground?: boolean;
  fetchPolicy?: LegacyFetchPolicy;
  notifyOnNetworkStatusChange?: boolean;
  onError?: OnErrorHandler;
  operationName?: string;
  prepare?: (helpers: UseQueryPrepareHelpers<TSchema>) => void;
  refetchInterval?: number;
  refetchOnReconnect?: boolean;
  refetchOnRender?: boolean;
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
    $refetch: (ignoreCache?: boolean) => Promise<unknown>;
  };

export interface UseQuery<GeneratedSchema extends { query: object }> {
  (
    options?: UseQueryOptions<GeneratedSchema>
  ): UseQueryReturnValue<GeneratedSchema>;
}

export const createUseQuery = <TSchema extends BaseGeneratedSchema>(
  client: GQtyClient<TSchema>,
  {
    defaults: {
      suspense: defaultSuspense,
      staleWhileRevalidate: defaultStaleWhileRevalidate,
      retry: defaultRetry,
    },
  }: ReactClientOptionsWithDefaults
): UseQuery<TSchema> => {
  type ResolverParts = ReturnType<typeof client.createResolver>;

  const cofetchingResolvers = new MultiDict<ResolverParts, ResolverParts>();

  let currentResolver: ResolverParts | undefined = undefined;

  return ({
    extensions,
    fetchInBackground = false,
    fetchPolicy,
    cachePolicy = translateFetchPolicy(fetchPolicy ?? 'cache-first'),
    suspense = defaultSuspense,
    notifyOnNetworkStatusChange = !suspense,
    onError,
    operationName,
    prepare,
    refetchInterval,
    refetchOnReconnect = true,
    refetchOnRender = true,
    refetchOnWindowVisible = true,
    retry = defaultRetry,
    retryPolicy = retry,
    staleWhileRevalidate = defaultStaleWhileRevalidate,
  } = {}) => {
    const render = useRerender();
    const debouncedRender = useDebouncedCallback(render, [render], 50);
    const getIsRendering = useIsRendering();
    const resolver = useMemo(() => {
      const resolver = client.createResolver({
        cachePolicy,
        extensions,
        operationName,
        retryPolicy,
        onSelect() {
          // Stick these resolvers together, their selections will be fetched
          // when either one of them requires a fetch.
          if (currentResolver && currentResolver !== resolver) {
            cofetchingResolvers.set(currentResolver, resolver);
          }

          // Trigger a fetch when selections are made outside of the rendering
          // phase, such as event listeners or polling.
          if (!getIsRendering()) {
            debouncedRender();

            // TODO: Make a debounced refetch instead of re-rendering, should
            // also prevents recursive refetching via prepass.
            // refetch({ skipPrepass: true });
          }
        },
      });

      currentResolver = resolver;

      return resolver;
    }, [cachePolicy, operationName, retryPolicy]);

    const {
      accessor: { query },
      accessor,
      context,
      resolve,
      selections,
    } = resolver;

    const [state, setState] = useState<{
      error?: GQtyError;
      promise?: Promise<unknown>;
    }>({});

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

    // Subscribe current selection to cache changes. Selection size changes
    // after render so it cannot be done via useEffect, instead refs has to be
    // used.
    {
      const selectionSizeRef = useRef(0);
      const unsubscribeRef = useRef<() => void>();

      useEffect(() => {
        if (selections.size === selectionSizeRef.current) return;
        selectionSizeRef.current = selections.size;

        unsubscribeRef.current?.();
        unsubscribeRef.current = context.cache.subscribe(
          [...selections].map((s) => s.cacheKeys.join('.')),
          debouncedRender
        );
      }, [debouncedRender, selections.size]);
    }

    const refetch = useCallback(
      async (options?: { ignoreCache?: boolean; skipPrepass?: boolean }) => {
        if (state.promise !== undefined) return;

        if (
          !fetchInBackground &&
          globalThis.document?.visibilityState !== 'visible'
        ) {
          return;
        }

        // Run the current selection again to make sure cache freshness.
        if (!options?.skipPrepass) {
          prepass(accessor, selections);
        }

        if (options?.ignoreCache === true) {
          context.shouldFetch = true;
        }

        if (!context.shouldFetch) return;

        try {
          // Sticky co-fetching selections is only needed when more than one
          // active context are making selections in one component. This usually
          // happens with mixed usage of useQuery and other query methods.
          const pendingPromises = [...(cofetchingResolvers.get(resolver) ?? [])]
            .map(async ({ context, resolve }) => {
              context.shouldFetch = true;

              return resolve();
            })
            .concat(resolve());

          const promise = Promise.all(pendingPromises);

          // Mutex lock, prevents multiple refetches from happening at the
          // same time, without triggering a render.
          state.promise = promise;

          if (!context.hasCacheHit && notifyOnNetworkStatusChange) {
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
          state.promise = undefined;

          setState({});
        }
      },
      [
        cachePolicy,
        context.shouldFetch,
        fetchInBackground,
        operationName,
        selections,
      ]
    );

    // Release co-fetching context
    useEffect(
      () => () => {
        cofetchingResolvers.delete(resolver);
      },
      []
    );

    // context.shouldFetch only changes during component render, which happens
    // after this hook is called. A useEffect hook that runs every render
    // triggers a post-render check.
    useEffect(() => {
      if (!refetchOnRender) return;

      refetch({ skipPrepass: true });
    });

    // refetchInterval
    useIntervalEffect(() => {
      refetch();
    }, refetchInterval);

    // refetchOnReconnect
    useOnlineEffect(() => {
      if (!refetchOnReconnect) return;

      refetch();
    }, [refetchOnReconnect]);

    // A rerender should be enough to trigger a soft check, fetch will
    // happen if any of the accessed cache value is stale.
    useWindowFocusEffect(() => {
      if (!refetchOnWindowVisible) return;

      refetch();
    });

    // Legacy staleWhileRevalidate
    const swrDiff = usePrevious(staleWhileRevalidate);
    useUpdateEffect(() => {
      if (!staleWhileRevalidate || Object.is(staleWhileRevalidate, swrDiff))
        return;

      refetch({ ignoreCache: true });
    }, [refetch, swrDiff]);

    return useMemo(() => {
      return new Proxy(
        Object.freeze({
          $refetch: (ignoreCache = false) => refetch({ ignoreCache }),
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
};
