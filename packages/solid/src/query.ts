import { debounceMicrotask } from 'debounce-microtasks';
import { prepass, type BaseGeneratedSchema, type Client } from 'gqty';
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
    let activeFetch: Promise<unknown> | undefined;
    let unsubscribe: (() => void) | undefined;
    let disposed = false;
    let preparing = false;

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
    } = client.createResolver({
      cachePolicy,
      extensions,
      retryPolicy,
      operationName,
      onSelect() {
        // With `prepare`, skip all selections except from the callback.
        if (prepare && !preparing) {
          return false;
        }

        debouncedSoftRefetch();

        return;
      },
    });

    const observeCache = (keys: string[]) => {
      unsubscribe?.();
      unsubscribe = context.cache.subscribe(keys, () => {
        if (!activeFetch) enqueueUpdate(publishCache);
      });
    };
    const [fetchVersion, setFetchVersion] = createSignal<number>();
    const [resource, { mutate }] = createResource(
      fetchVersion,
      async () => {
        const keys = [...selections].map((selection) =>
          selection.cacheKeys.join('.')
        );
        unsubscribe?.();
        unsubscribe = undefined;

        // The resource owns the actual resolver promise, including errors.
        // Cache notifications must not settle it before Core has retired this
        // participation and preserved any selections made during the fetch.
        const promise = resolve();
        activeFetch = promise;

        try {
          await promise;
          if (!disposed) observeCache(keys);
          return accessor;
        } finally {
          if (activeFetch === promise) {
            activeFetch = undefined;
            if (!disposed && context.shouldFetch && selections.size > 0) {
              debouncedSoftRefetch();
            }
          }
        }
      },
      {
        storage: () =>
          createSignal<Schema | undefined>(undefined, { equals: false }),
      }
    );
    const publishCache = () => {
      if (!disposed && !activeFetch) mutate(() => accessor);
    };
    const startFetch = () => {
      if (
        !disposed &&
        !activeFetch &&
        context.shouldFetch &&
        selections.size > 0
      ) {
        setFetchVersion((version = 0) => version + 1);
      }
    };
    const runPrepare = () => {
      preparing = true;
      try {
        prepare?.(accessor, { prepass });
      } finally {
        preparing = false;
      }
    };

    const $refetch = (options?: {
      ignoreCache?: boolean;
      skipPrepass?: boolean;
    }) => {
      // Core retains late selections and their flags until this fetch settles.
      // Neither a soft refetch nor an obsolete completion may reset them.
      if (disposed || activeFetch) return;

      if (
        options?.ignoreCache ||
        (!options?.skipPrepass && client.cache !== context.cache)
      ) {
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
          runPrepare();
        } else {
          prepass(accessor, selections);
        }
      }

      if (selections.size === 0) {
        return;
      }

      if (!context.shouldFetch) {
        observeCache(
          [...selections].map((selection) => selection.cacheKeys.join('.'))
        );
        context.reset();
        selections.clear();
        return;
      }

      enqueueUpdate(startFetch);
    };

    // Equivilent to refetchOnRender in React.
    onMount(() => $refetch({ skipPrepass: true }));

    onCleanup(() => {
      disposed = true;
      pendingUpdates.delete(startFetch);
      pendingUpdates.delete(publishCache);
      unsubscribe?.();
    });

    // Collect selections from the `prepare` callback.
    if (prepare) {
      context.shouldFetch = false;

      runPrepare();
      startFetch();
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
        if (disposed || activeFetch) {
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
