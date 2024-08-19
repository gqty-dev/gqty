import { debounceMicrotask } from 'debounce-microtasks';
import { prepass, type BaseGeneratedSchema, type Client } from 'gqty';
import createDeferred from 'p-defer';
import {
  batch,
  createEffect,
  createResource,
  createSignal,
  onCleanup,
  onMount,
} from 'solid-js';
import type {
  ArrowFunction,
  CommonOptions,
  DefaultOptions,
  SolidClientOptions,
} from '.';
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
export const createQuery = <Schema extends BaseGeneratedSchema>(
  client: Client<Schema>,
  clientOptions?: SolidClientOptions
): CreateQuery<Schema> => {
  const pendingUpdates = new Set<ArrowFunction>();
  const enqueueUpdate = (refetch: ArrowFunction) => {
    pendingUpdates.add(refetch);
    dequeueUpdate();
  };
  const dequeueUpdate = debounceMicrotask(() => {
    batch(() => {
      pendingUpdates.forEach((refetch) => refetch());
      pendingUpdates.clear();
    });
  });

  return ({
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
    let unsubscribe: (() => void) | undefined;

    const debouncedSoftRefetch = debounceMicrotask(
      () => $refetch({ skipPrepass: true }),
      { limitAction: 'ignore' }
    );

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
        // When new selections are made during an active fetch, we need
        // to enqueue a new fetch after the current one completes. Detaching
        // the current promise causes `$refetch()` to call `refetch` from
        // `createResource` with a pending promise, which in turns cause
        // the UI to halt indefinitely due to Solid's design.

        // Triggers a soft refetch when selections are made outside of the solid
        // lifecycle.
        debouncedSoftRefetch();

        // With `prepare`, skip all selections except from the callback.
        if (prepare) {
          return false;
        }

        return;
      },
    });

    const [resource, { refetch }] = createResource<Schema | undefined>(
      () => resolvePromise,
      { storage: () => createSignal<any>(undefined, { equals: false }) }
    );

    const $refetch = async (options?: {
      ignoreCache?: boolean;
      skipPrepass?: boolean;
    }) => {
      if (options?.ignoreCache || client.cache !== context.cache) {
        context.shouldFetch = true;
      }

      // Soft-refetches here may not know if the WeakRefs in the cache is
      // already garbage collected. Running the selections again to update
      // the context with the latest cache freshness, this will push back the
      // garbage collection if the specific implementation has LRU components.
      if (!options?.skipPrepass && isFinite(client.cache.maxAge)) {
        // Selections may have been cleared by a previous soft-refetch skipped
        // by a fresh cache, we just restore the selections from the last
        // successful fetch to run the prepass.
        if (selections.size === 0) {
          restorePreviousSelections();
        }

        if (prepare) {
          prepare(accessor, { prepass });
        } else {
          prepass(accessor, selections);
        }
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
      resolvePromise.then(
        () => resetMutex?.(),
        // Catch here to prevent promise leaking (unhandled rejection) from
        // ErrorBoundary.
        () => resetMutex?.()
      );

      unsubscribe?.();
      unsubscribe = subscribe({
        onNext() {
          // Re-render UI when there is no active fetch, i.e. subscriptions.
          if (!resolvePromise) {
            enqueueUpdate(refetch);
          } else {
            deferred.resolve(accessor);
          }
        },
        onError(error) {
          deferred.reject(error);
        },
        onComplete() {
          deferred.resolve(accessor);
        },
      });

      enqueueUpdate(refetch);
    };

    // Equivilent to refetchOnRender in React.
    onMount(() => $refetch({ skipPrepass: true }));

    onCleanup(() => unsubscribe?.());

    // Collect selections from the `prepare` callback.
    if (prepare) {
      context.shouldFetch = false;

      const prepareFn = prepare;

      // Bypassing prepare lock at the `onSelect()` callback above.
      prepare = undefined;

      prepareFn(accessor, { prepass });

      prepare = prepareFn;

      if (context.shouldFetch) {
        resolvePromise = resolve() as Promise<Schema>;
      }
    }

    if (refetchInterval) {
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
      $refetch: async (ignoreCache = true) => {
        if (resolvePromise) {
          return;
        }

        // Always replace current selections with those from last successful
        // fetch for user-triggered refetches.
        restorePreviousSelections();

        return await $refetch({ ignoreCache });
      },
    });
  };
};
