import {
  useIntervalEffect,
  usePrevious,
  useRerender,
  useUpdateEffect,
} from '../hooks';
import {
  GQtyError,
  prepass,
  type BaseGeneratedSchema,
  type GQtyClient,
  type GeneratedSchemaObject,
  type RetryOptions,
} from 'gqty';
import { MultiDict } from 'multidict';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ModifiedSet from '../ModifiedSet';
import {
  translateFetchPolicy,
  type LegacyFetchPolicy,
  type OnErrorHandler,
} from '../common';
import { useOnlineEffect } from '../useOnlineEffect';
import { useRenderSession } from '../useRenderSession';
import { useWindowFocusEffect } from '../useWindowFocusEffect';
import type { ReactClientOptionsWithDefaults } from '../utils';

export interface UseQueryPrepareHelpers<
  GeneratedSchema extends {
    query: object;
  },
> {
  readonly prepass: typeof prepass;
  readonly query: GeneratedSchema['query'];
}

export interface UseQueryOptions<TSchema extends BaseGeneratedSchema> {
  /**
   * Defines how a query should fetch from the cache and network.
   *
   * - `default`: Serves the cached contents when it is fresh, and if they are
   * stale within `staleWhileRevalidate` window, fetches in the background and
   * updates the cache. Or simply fetches on stale cache or cache miss. During
   * SWR, a successful fetch will not notify cache updates. New contents are
   * served on next query.
   * - `no-store`: Always fetch and does not update on response.
   * GQty creates a temporary cache at query-level which immediately expires.
   * - `reload`: Always fetch, updates on response.
   * - `no-cache`: Same as `reload`, for GraphQL does not support conditional
   * requests.
   * - `force-cache`: Serves the cached contents regardless of staleness. It
   * fetches on cache miss or a stale cache, updates cache on response.
   * - `only-if-cached`: Serves the cached contents regardless of staleness,
   * throws a network error on cache miss.
   *
   * _It takes effort to make sure the above stays true for all supported
   * frameworks, please consider sponsoring so we can dedicate even more time on
   * this._
   */
  cachePolicy?: RequestCache;
  /** Custom GraphQL extensions to be exposed to the query fetcher. */
  extensions?: Record<string, unknown>;
  /**
   * Allow fetches when the browser is minified or hidden. When disabled, use
   * the `refetchOnWindowVisible` option or call `$refetch()` to fetch.
   */
  fetchInBackground?: boolean;
  /** Specify the value of $state.isLoading before the first fetch. */
  initialLoadingState?: boolean;
  /** Enable this to update $state.isLoading or suspense during refetches. */
  notifyOnNetworkStatusChange?: boolean;
  /**
   * A callback function that is called when an error occurs in the query
   * fetcher, and `maxRetries` is reached.
   */
  onError?: OnErrorHandler;
  /**
   * Specify a custom GraphQL operation name in the query. This separates the
   * query from the internal query batcher, resulting a standalone fetch for
   * easier debugging.
   */
  operationName?: string;
  /**
   * Making selections before the component is rendered, allowing Suspense
   * to happen during first render.
   */
  prepare?: (helpers: UseQueryPrepareHelpers<TSchema>) => void;
  /**
   * Soft-refetch on the specified interval, skip this option to disable.
   */
  refetchInterval?: number;
  /**
   * Soft-refetch when the browser regains connectivity.
   *
   * @default true
   */
  refetchOnReconnect?: boolean;
  /**
   * Soft-refetch on render.
   *
   * @default true
   */
  refetchOnRender?: boolean;
  /**
   * Soft-refetch when user comes back to the browser tab.
   *
   * @default true
   */
  refetchOnWindowVisible?: boolean;
  /** Retry strategy upon fetch failures. */
  retryPolicy?: RetryOptions;
  /**
   * Changes rendering in the following ways,
   * 1. Suspenses the component during query fetch.
   * 2. Throws the latest fetch error for error boundaries.
   *
   * @default false
   */
  suspense?: boolean;

  /** @deprecated Use `retryPolicy` instead. */
  retry?: RetryOptions;
  /** @deprecated Use `cachePolicy` instead. */
  fetchPolicy?: LegacyFetchPolicy;
  /** @deprecated Use `staleWhileRevalidate` in the Cache options. */
  staleWhileRevalidate?: boolean | object | number | string | null;
}

export interface UseQueryState {
  /** The current loading state when suspense is disabled. */
  readonly isLoading: boolean;

  /**
   * Latest scheduler Error, for more in-depth error management use
   * `useMetaState` hook
   */
  error?: GQtyError;
}

export type Writeable<T> = { -readonly [P in keyof T]: T[P] };

export type UseQueryReturnValue<GeneratedSchema extends { query: object }> =
  GeneratedSchema['query'] & {
    $state: UseQueryState;
    $refetch: (
      /**
       * Hard refetch, ignoring current cache freshness.
       *
       * @default true
       */
      ignoreCache?: boolean
    ) => Promise<unknown>;
  };

export interface UseQuery<
  GeneratedSchema extends { query: GeneratedSchemaObject },
> {
  (
    options?: UseQueryOptions<GeneratedSchema>
  ): UseQueryReturnValue<GeneratedSchema>;
}

export const createUseQuery = <TSchema extends BaseGeneratedSchema>(
  client: GQtyClient<TSchema>,
  {
    defaults: {
      initialLoadingState: defaultInitialLoadingState,
      suspense: defaultSuspense,
      staleWhileRevalidate: defaultStaleWhileRevalidate,
      retry: defaultRetry,
    },
  }: ReactClientOptionsWithDefaults
): UseQuery<TSchema> => {
  type ResolverParts = ReturnType<typeof client.createResolver>;

  const cofetchingResolvers = new MultiDict<ResolverParts, ResolverParts>();

  // We keep track of the whole stack of resolvers ever created before a fetch
  // happens. When the current cache has normalization disabled, and a fetch
  // affects an existing cache key at the same time, all selections made in
  // other contexts should also be included.
  const resolverStack = new ModifiedSet<ResolverParts>();

  return ({
    extensions,
    fetchInBackground = false,
    fetchPolicy,
    cachePolicy = translateFetchPolicy(fetchPolicy ?? 'cache-first'),
    initialLoadingState = defaultInitialLoadingState,
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
    /** Identify the initial state before the first fetch. */
    const initialStateRef = useRef(initialLoadingState);

    const render = useRerender();
    const renderSession = useRenderSession<string, boolean>();

    renderSession.set('isRendering', true);

    const resolver = useMemo(() => {
      const resolver = client.createResolver({
        cachePolicy,
        extensions,
        operationName,
        retryPolicy,
        onSelect() {
          // Stick these resolvers together, their selections will be fetched
          // when either one of them requires a fetch.
          const currentResolver = resolverStack.lastAdded;
          if (currentResolver && currentResolver !== resolver) {
            cofetchingResolvers.set(currentResolver, resolver);
          }

          // Any selections happening will have this resolver stacked. When a
          // fetch happens without cache normalization, all stacked resovlers
          // with selections sharing common cache keys are also included.
          resolverStack.add(resolver);

          // Trigger a fetch when selections are made outside of the rendering
          // phase, such as event listeners or polling.
          if (!renderSession.get('isRendering')) {
            // Assuming external access are mostly synchronous, run at the next
            // microtask.
            Promise.resolve().then(() =>
              refetch({ skipPrepass: true, skipOnError: true })
            );
          } else if (!renderSession.get('postFetch')) {
            // Force refetch on re-renders not triggered by a fetch response.
            if (
              cachePolicy === 'reload' ||
              cachePolicy === 'no-cache' ||
              cachePolicy === 'no-store'
            ) {
              resolver.context.shouldFetch = true;
            }

            // Clears previous selections if the current render is not triggered
            // by a fetch, because it implies a user-triggered state change
            // where old query inputs may be stale. But only clear selections
            // once right when the first selection is made, because we want to
            // hold on to the last successful selections as long as possible for
            // user-triggered $refetch().
            //
            // Only reset once because selections from now on belongs to the
            // next fetch.
            if (!renderSession.get('postFetchSelectionCleared')) {
              renderSession.set('postFetchSelectionCleared', true);

              selections.clear();
            }
          }
        },
      });

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
      if (state.error) {
        throw state.error;
      }

      // Prevents excessive suspense fallback, throws only on empty cache.
      if (
        state.promise &&
        (!context.hasCacheHit || notifyOnNetworkStatusChange)
      ) {
        throw state.promise;
      }
    }

    useEffect(
      () =>
        context.cache.subscribe(
          [...selections].map((s) => s.cacheKeys.join('.')),
          render
        ),
      [render, selections.size]
    );

    const refetch = useCallback(
      async (options?: {
        ignoreCache?: boolean;
        skipPrepass?: boolean;
        skipOnError?: boolean;
      }) => {
        if (state.promise !== undefined) {
          return;
        }

        if (state.error && (options?.skipOnError ?? !suspense)) {
          return;
        }

        if (
          !fetchInBackground &&
          globalThis.document?.visibilityState === 'hidden'
        ) {
          return;
        }

        if (options?.ignoreCache === true) {
          context.shouldFetch = true;
        } else {
          // Soft-refetches here may not know if the WeakRefs in the cache is
          // already garbage collected. Running the selections again to update
          // the context with the latest cache freshness, this will push back the
          // garbage collection if the specific implementation has LRU components.
          if (!options?.skipPrepass && isFinite(client.cache.maxAge)) {
            prepass(accessor, selections);
          }

          // Skip SWR fetches to prevent render-fetch loops.
          if (renderSession.get('postFetch') && !context.hasCacheMiss) {
            context.shouldFetch = false;
          }
        }

        if (!context.shouldFetch) {
          return;
        }

        // Cancel initial loading state
        initialStateRef.current = false;

        try {
          // Stitch stacked selections which shared the same cache key, even if
          // those selections don't need fetching. Because without normalization
          // they will be overwritten by this fetch.
          //
          // [ ] There is one overfetch triggered by parallel renders that I
          // cannot eliminate right now. Deferring to future me.
          if (!client.cache.normalizationOptions) {
            const seen = new Set<string>();

            for (const { cacheKeys: [type, field] = [] } of selections) {
              if (type !== 'query') {
                continue;
              }

              // Skip iterations with duplicate top level cache keys
              if (seen.has(field)) {
                continue;
              } else {
                seen.add(field);
              }

              resolversLoop: for (const stackResolver of resolverStack) {
                if (stackResolver === resolver) {
                  continue;
                }

                for (const {
                  cacheKeys: [objType, objField],
                } of stackResolver.selections) {
                  if (type === objType && field === objField) {
                    cofetchingResolvers.set(resolver, stackResolver);

                    continue resolversLoop;
                  }
                }
              }
            }
          }

          // Sticky co-fetching selections is only needed when more than one
          // active context are making selections in one component. This usually
          // happens with mixed usage of useQuery and other query methods.
          const pendingPromises = [...(cofetchingResolvers.get(resolver) ?? [])]
            .map(({ context, resolve }) => {
              context.shouldFetch = true;

              const ret = resolve();

              context.shouldFetch = false;

              return ret;
            })
            .concat(resolve());

          context.shouldFetch = false;

          const promise = Promise.all(pendingPromises);

          // Mutex lock, prevents multiple refetches from happening at the
          // same time, without triggering a render.
          state.promise = promise;

          if (!context.hasCacheHit || notifyOnNetworkStatusChange) {
            setState({ promise });
          }

          // Let the fetch happen.
          await promise;
        } catch (e) {
          const error = GQtyError.create(e);

          onError?.(error);
          setState({ error });
        } finally {
          context.reset();

          // Synchronous mutex release, just to be safe.
          state.promise = undefined;

          // Release co-fetching context, dropping reference to the last
          // resolver created in current render to prevent it from affecting the
          // next render.
          resolverStack.clear();
          cofetchingResolvers.delete(resolver);

          renderSession.set('postFetch', true);

          // Trigger a post-fetch render, keeps the error if caught.
          setState(({ error }) => ({
            error,
            promise: undefined,
          }));
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

    // Foolproof check on first render only when initialLoadingState is enabled,
    // because it's confusing for this particular use case.
    useEffect(() => {
      if (initialLoadingState && selections.size === 0) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(
            '[GQty] No selections found, ' +
              'this is rarely expected with initialLoadingState.'
          );
        }
      }
    }, []);

    // context.shouldFetch only changes during component render, which happens
    // after this hook is called. A useEffect hook that runs every render
    // triggers a post-render check.
    useEffect(() => {
      if (!refetchOnRender) {
        return;
      }

      refetch({ skipPrepass: true });
    });

    // refetchInterval
    useIntervalEffect(() => {
      refetch();
    }, refetchInterval);

    // refetchOnReconnect
    useOnlineEffect(() => {
      if (!refetchOnReconnect) {
        return;
      }

      refetch();
    }, [refetchOnReconnect]);

    // A rerender should be enough to trigger a soft check, fetch will
    // happen if any of the accessed cache value is stale.
    useWindowFocusEffect(() => {
      if (!refetchOnWindowVisible) {
        return;
      }

      refetch();
    });

    // Legacy staleWhileRevalidate
    const swrDiff = usePrevious(staleWhileRevalidate);
    useUpdateEffect(() => {
      if (!staleWhileRevalidate || Object.is(staleWhileRevalidate, swrDiff)) {
        return;
      }

      refetch({ ignoreCache: true });
    }, [refetch, swrDiff]);

    return useMemo(() => {
      return new Proxy(
        Object.freeze({
          $refetch: (ignoreCache = true) =>
            refetch({ ignoreCache, skipOnError: false }),
          $state: Object.freeze({
            isLoading: state.promise !== undefined || initialStateRef.current,
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
    }, [query, refetch, state.error, state.promise]);
  };
};
