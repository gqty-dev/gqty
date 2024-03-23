import {
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
import ModifiedSet from '../ModifiedSet';
import {
  translateFetchPolicy,
  type LegacyFetchPolicy,
  type OnErrorHandler,
} from '../common';
import { useOnlineEffect } from '../useOnlineEffect';
import { useRenderSession } from '../useRenderSession';
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
  extensions?: Record<string, unknown>;
  fetchInBackground?: boolean;
  fetchPolicy?: LegacyFetchPolicy;
  initialLoadingState?: boolean;
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
  __experimentalGreedyFetch?: boolean;
}

export interface UseQueryState {
  /** Useful for `Non-Suspense` usage. */
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

  // We keep track of the whole stack of resolvers ever created before a fetch
  // happens. When the current cache has normalization disabled, and a fetch
  // affects an existing cache key at the same time, all selections made in
  // other contexts will also be included.
  const resolverStack = new ModifiedSet<ResolverParts>();

  return ({
    extensions,
    fetchInBackground = false,
    fetchPolicy,
    cachePolicy = translateFetchPolicy(fetchPolicy ?? 'cache-first'),
    initialLoadingState = false,
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
    __experimentalGreedyFetch,
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
            refetch({ skipPrepass: true });
          }
          // Clears previous selections if the current render is not triggered
          // by a fetch, because it implies a user-triggered state change where
          // old query inputs may be stale. Only clear selections once right
          // when the first selection is made.
          else if (
            !renderSession.get('postFetch') &&
            !renderSession.get('postFetchSelectionCleared')
          ) {
            renderSession.set('postFetchSelectionCleared', true);

            selections.clear();
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
      if (state.error) throw state.error;

      // Prevents excessive suspense fallback, throws only on empty cache.
      if (state.promise && !context.hasCacheHit) throw state.promise;
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
      async (options?: { ignoreCache?: boolean; skipPrepass?: boolean }) => {
        if (state.promise !== undefined) {
          return;
        }

        if (
          !fetchInBackground &&
          globalThis.document?.visibilityState === 'hidden'
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

        if (!context.shouldFetch) {
          return;
        }

        initialStateRef.current = true;

        try {
          // Forcibly includes all resolvers in the same render when one of them
          // requires a fetch.
          if (__experimentalGreedyFetch) {
            for (const stackResolver of resolverStack) {
              cofetchingResolvers.set(resolver, stackResolver);
            }
          }

          // Stitch stacked selections what shared the same cache key, even if
          // those selections don't need fetching. Because without normalization
          // they will be overwritten by this fetch.
          // [ ] There is one overfetch triggered by parallel renders that I
          // cannot eliminate right now. Deferring to future me.
          if (!client.cache.normalizationOptions) {
            for (const {
              cacheKeys: [subType, subField],
            } of selections) {
              if (subType !== 'query') {
                continue;
              }

              for (const stackResolver of resolverStack) {
                if (stackResolver === resolver) {
                  continue;
                }

                for (const {
                  cacheKeys: [objType, objField],
                } of stackResolver.selections) {
                  if (subType == objType && subField == objField) {
                    cofetchingResolvers.set(resolver, stackResolver);

                    continue;
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

          // Let the fetch happen.
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

          // Release co-fetching context, dropping reference to the last
          // resolver created in current render to prevent it from affecting the
          // next render.
          resolverStack.clear();
          cofetchingResolvers.delete(resolver);

          renderSession.set('postFetch', true);

          // Trigger a post-fetch render, keeps the error if caught.
          setState(({ error }) => ({ error }));
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
          $refetch: (ignoreCache = true) => refetch({ ignoreCache }),
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
    }, [query, refetch, state]);
  };
};
