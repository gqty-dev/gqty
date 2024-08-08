import { debounceMicrotask } from 'debounce-microtasks';
import { prepass, type BaseGeneratedSchema, type Client } from 'gqty';
import createDeferred from 'p-defer';
import {
  createEffect,
  createResource,
  createSignal,
  onCleanup,
  onMount,
} from 'solid-js';
import type { CommonOptions, DefaultOptions, SolidClientOptions } from '.';
import { createIntervalEffect } from './createIntervalEffect';
import { createOnlineSignal } from './createOnlineSignal';
import { createWindowVisibleSignal } from './createWindowVisibleSignal';

export type PrepareQueryHelpers<Schema extends BaseGeneratedSchema> = {
  prepass: typeof prepass<Schema>;
};

type QueryOptions<Schema extends BaseGeneratedSchema> = {
  /**
   * Making selections before the component is rendered, allowing Suspense
   * to happen during first render.
   */
  prepare?: (schema: Schema, helpers?: PrepareQueryHelpers<Schema>) => void;
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
   * Soft-refetch when user comes back to the browser tab.
   *
   * @default true
   */
  refetchOnWindowVisible?: boolean;
};

export type CreateQueryOptions<Schema extends BaseGeneratedSchema> =
  CommonOptions & DefaultOptions & QueryOptions<Schema>;

export type CreateQuery<Schema extends BaseGeneratedSchema> = (
  options?: CreateQueryOptions<Schema>
) => {
  (): Schema['query'];
  $state: {
    loading: boolean;
    error?: Error;
  };
  $refetch: (
    /**
     * Refetch even if the current cache is still fresh.
     *
     * @default true
     */
    ignoreCache?: boolean
  ) => Promise<void>;
};

/**
 * Live Queries: A long-living cache subscription on the selections made for the
 * last successful fetch. Unsubscribing before a fetch starts, and resubscribe
 * after a fetch completes.
 */
export const createQuery =
  <Schema extends BaseGeneratedSchema>(
    client: Client<Schema>,
    clientOptions?: SolidClientOptions
  ): CreateQuery<Schema> =>
  ({
    cachePolicy = clientOptions?.defaults?.cachePolicy ?? 'default',
    extensions,
    operationName,
    prepare,
    retryPolicy = clientOptions?.defaults?.retryPolicy,
    refetchInterval,
    refetchOnReconnect = true,
    refetchOnWindowVisible = true,
  } = {}) => {
    let resolvePromise: Promise<Schema> | undefined;
    let unsubscribeCache: (() => void) | undefined;
    let unsubscribeFetch: (() => void) | undefined;

    const {
      accessor,
      context,
      resolve,
      restorePreviousSelections,
      selections,
      subscribe,
    } = client.createResolver({
      cachePolicy,
      extensions,
      retryPolicy,
      operationName,
      onSelect() {
        // tl;dr - Do not pass the query accessor outside of solid components.
        //
        // Prevent pre-mature selections with an active fetch. Although these
        // selections are actually desired when selections are made from
        // external sources outside of the solid component, which in turn
        // triggers a soft refetch next microtask; doing this during an active
        // fetch creates a racing condition.
        //
        // We assume solid users more disciplined then their React counterpart.
        return !resolvePromise;
      },
    });

    const [resource, { refetch }] = createResource<Schema | undefined>(
      () => resolvePromise,
      { storage: () => createSignal<any>(undefined, { equals: false }) }
    );

    onMount(() => {
      // Triggers a soft refetch when selections are made outside of the solid
      // lifecycle.
      unsubscribeCache = context.subscribeSelect(
        debounceMicrotask(() => $refetch({ skipPrepass: true }), {
          limitAction: 'ignore',
        })
      );

      $refetch({ skipPrepass: true });
    });

    onCleanup(() => {
      unsubscribeCache?.();
      unsubscribeFetch?.();
    });

    const $refetch = async (options?: {
      ignoreCache?: boolean;
      skipPrepass?: boolean;
    }) => {
      // Internal resolve mutex
      if (resolvePromise) {
        return;
      }

      if (options?.ignoreCache) {
        context.shouldFetch = true;
      }

      // Soft-refetches here may not know if the WeakRefs in the cache is
      // already garbage collected. Running the selections again to update
      // the context with the latest cache freshness, this will push back the
      // garbage collection if the specific implementation has LRU components.
      if (!options?.skipPrepass && isFinite(client.cache.maxAge)) {
        if (selections.size === 0) {
          restorePreviousSelections();
        }

        prepass(accessor, selections);
      }

      if (selections.size === 0) {
        return;
      }

      // Release mutex
      let resetMutex: (() => void) | undefined = () => {
        resetMutex = undefined;
        resolvePromise = undefined;

        context.reset();
      };

      if (!context.shouldFetch) {
        resetMutex?.();

        // Clearing selections to prevent stale inputs.
        //
        // Potential pitfall: If $refetch() is called synchronously during a
        // post-fetch update, selections will be cleared here before it can be
        // stored into prevSelections.
        if (!resolvePromise) {
          selections.clear();
        }

        return;
      }

      // [ ] cofetch selections for denormalized caches

      const deferred = createDeferred<Schema>();

      resolvePromise = deferred.promise;

      // Note: Do not use `finally` here, it pushes `resetMutex` too far back
      // the event loop. Users calling `$refetch()` during the next render would
      // always be mutex-blocked.
      deferred.promise.then(
        () => resetMutex?.(),
        // Catch here to prevent promise leaking (unhandled rejection) from
        // ErrorBoundary.
        () => resetMutex?.()
      );

      unsubscribeFetch?.();
      unsubscribeFetch = subscribe({
        onNext() {
          // Multiple calls may happen because of cache subscription, only the
          // first call should resolve the ongoing query.
          if (resolvePromise === deferred.promise) {
            deferred.resolve(accessor);
          }
          // Otherwise, re-render UI when there is no active fetch.
          else if (!resolvePromise) {
            refetch();
          }
        },
        onError(error) {
          // Mutex promise may have been resolved by a previous onNext call.
          if (resolvePromise === deferred.promise) {
            deferred.reject(error);
          }
        },
        onComplete() {
          // Mutex promise may have been resolved by a previous onNext call.
          if (resolvePromise === deferred.promise) {
            deferred.resolve(accessor);
          }
        },
      });

      refetch();
    };

    // With `prepare`, selections are only collected within the provided
    // function. Accessing other properties in the proxy should not trigger
    // further fetches.
    if (prepare) {
      context.shouldFetch = false;

      prepare(accessor, { prepass });

      if (context.shouldFetch) {
        resolvePromise = resolve() as Promise<Schema>;
      }
    }

    if (refetchInterval) {
      console.log({ refetchInterval });
      createIntervalEffect(() => $refetch(), refetchInterval);
    }

    if (refetchOnReconnect) {
      const online = createOnlineSignal();

      createEffect(() => {
        if (online()) $refetch();
      });
    }

    if (refetchOnWindowVisible) {
      const visible = createWindowVisibleSignal();

      createEffect(() => {
        if (visible()) $refetch();
      });
    }

    return Object.assign(() => resource()?.query ?? accessor.query, {
      $state: {
        get loading() {
          return resource.loading;
        },
        get error() {
          return resource.error;
        },
      },
      $refetch: (ignoreCache = true) => {
        if (!resolvePromise) {
          // Always replace current selections with those from last successful
          // fetch for user-triggered refetches.
          restorePreviousSelections();
        }

        return $refetch({ ignoreCache });
      },
    });
  };
