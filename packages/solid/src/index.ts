import { debounceMicrotask } from 'debounce-microtasks';
import {
  GQtyError,
  prepass,
  type BaseGeneratedSchema,
  type Client,
} from 'gqty';
import { createSignal } from 'solid-js';
import type {
  CreateQueryOptions,
  SolidClient,
  SolidClientOptions,
} from './types';

// Export the types to prevent tsc from removing the imports
export type { BaseGeneratedSchema, Client };

export const createSolidClient = <Schema extends BaseGeneratedSchema>(
  client: Client<Schema>,
  options?: SolidClientOptions
): SolidClient<Schema> => {
  const { defaults } = options ?? {};

  return {
    createQuery: ({
      cachePolicy = defaults?.cachePolicy ?? 'default',
      extensions,
      operationName,
      prepare,
      retryPolicy = defaults?.retryPolicy,
    }: CreateQueryOptions<Schema> = {}) => {
      let resolvePromise: Promise<unknown> | undefined;
      let resolveError: Error | undefined;
      let unsubscribe: (() => void) | undefined;

      const { accessor, context, resolve, selections, subscribe } =
        client.createResolver({
          cachePolicy,
          extensions,
          retryPolicy,
          operationName,

          // [ ] Clear selections post-fetch to remove stale inputs.
        });

      const [schema, setSchema] = createSignal(accessor, { equals: false });

      const rerender = () => {
        setSchema(schema);
      };

      const resubscribeLater = debounceMicrotask((): void => {
        if (resolvePromise) return;

        const mutexPromise = new Promise(() => {});

        resolvePromise = mutexPromise;

        const resetMutex = () => {
          if (resolvePromise === mutexPromise) {
            context.shouldFetch = false;
            context.hasCacheHit = false;
            context.hasCacheMiss = false;

            resolvePromise = undefined;
          }
        };

        unsubscribe?.();
        unsubscribe = subscribe({
          onError(error) {
            // if (!(error instanceof GQtyError)) throw error;

            resolveError = error;

            rerender();
          },
          onNext() {
            // Skips rerender if there is already an error.
            if (resolveError) return;

            resetMutex();

            rerender();
          },
          onComplete() {
            resetMutex();
          },
        });
      });

      context.subscribeSelect(() => {
        if (!context.shouldFetch) return;

        resubscribeLater();
      });

      const refetch = async (options?: {
        ignoreCache?: boolean;
        skipPrepass?: boolean;
      }) => {
        // Internal resolve mutex
        if (resolvePromise) return;

        // Soft-refetches here may not know if the WeakRefs in the cache is
        // already garbage collected. Running this again to update context with
        // the latest cache freshness, this inevitably affects the timing of
        // garbage collection if the specific implementation has LRU components.
        if (!options?.skipPrepass && isFinite(client.cache.maxAge)) {
          prepass(accessor, selections);
        }

        if (options?.ignoreCache) {
          context.shouldFetch = true;
        }

        if (!context.shouldFetch) return;

        // [ ] cofetch selections for denormalized caches

        resolvePromise = resolve();
        resolveError = undefined;

        try {
          await resolvePromise;

          // Triggers Suspense
          rerender();
        } catch (error) {
          if (!(error instanceof GQtyError)) throw error;

          resolveError = error;

          // Triggers ErrorBounary
          rerender();
        } finally {
          context.shouldFetch = false;
          context.hasCacheHit = false;
          context.hasCacheMiss = false;

          // Release mutex
          resolvePromise = undefined;
        }
      };

      // With `prepare`, selections are only collected within the provided
      // function. Accessing other properties in the proxy should not trigger
      // further fetches.
      if (prepare) {
        context.shouldFetch = false;

        prepare(accessor, { prepass });

        if (context.shouldFetch) {
          resolvePromise = resolve();
        }
      }

      if (resolvePromise && !context.hasCacheHit) {
        // [ ] Test if suspense still works after first render, because
        // signals are fine-grained and store updates may not means
        // a component level render.
        throw resolvePromise;
      }

      if (resolveError) {
        throw resolveError;
      }

      return {
        schema,
        $refetch: (ignoreCache = true) => refetch({ ignoreCache }),
        debug: rerender,
      };
    },
  };
};
