import type { BaseGeneratedSchema } from '..';
import { GQtyError, type RetryOptions } from '../../Error';
import { fetchSelections, subscribeSelections } from '../resolveSelections';
import { updateCaches } from '../updateCaches';
import type { CreateLegacyMethodOptions } from './client';
import { convertSelection, type LegacySelection } from './selection';

export type LegacyFetchOptions = Omit<RequestInit, 'body'>;

export interface LegacyResolved {
  <T = unknown>(fn: () => T, opts?: LegacyResolveOptions<T>): Promise<T>;
}

export interface LegacyResolveOptions<TData> {
  /**
   * Ignore cache data during selection, which always results in a fetch.
   */
  refetch?: boolean;
  /**
   * Do not update the cache after fetch, return the result only.
   */
  noCache?: boolean;
  /**
   * Activate special handling of non-serializable variables,
   * for example, files uploading
   *
   * @default false
   */
  nonSerializableVariables?: boolean;
  /**
   * Middleware function that is called if valid cache is found
   * for all the data requirements, it should return `true` if the
   * the resolution and fetch should continue, and `false`
   * if you wish to stop the resolution, resolving the promise
   * with the existing cache data.
   */
  onCacheData?: (data: TData) => boolean;
  /**
   * On No Cache found
   */
  onNoCacheFound?: () => void;
  /**
   * Get every selection intercepted in the specified function
   */
  onSelection?: (selection: LegacySelection) => void;
  /**
   * On subscription event listener
   */
  onSubscription?: (
    event:
      | {
          type: 'data';
          unsubscribe: () => Promise<void>;
          data: TData;
          error?: undefined;
        }
      | {
          type: 'with-errors';
          unsubscribe: () => Promise<void>;
          data?: TData;
          error: GQtyError;
        }
      | {
          type: 'start' | 'complete';
          unsubscribe: () => Promise<void>;
          data?: undefined;
          error?: undefined;
        }
  ) => void;
  /**
   * Function called on empty resolution
   */
  onEmptyResolve?: () => void;

  /**
   * Retry strategy
   */
  retry?: RetryOptions;

  /**
   * Pass any extra fetch options
   */
  fetchOptions?: LegacyFetchOptions;

  /**
   * Query operation name
   */
  operationName?: string;
}

/**
 * `resolved()` has to be re-implemented from the parts because the new
 * `resolve()` closes subscriptions on first data to mimic a one-time promise,
 * while `resolved()` exposes callbacks, letting subcriptions outlive the
 * promise.
 */
export const createLegacyResolved = <
  TSchema extends BaseGeneratedSchema = BaseGeneratedSchema,
>({
  cache,
  context: globalContext,
  debugger: debug,
  fetchOptions: { fetcher, retryPolicy },
  fetchOptions: clientFetchOptions,
  resolvers: { createResolver },
  subscribeLegacySelections,
}: CreateLegacyMethodOptions<TSchema>): LegacyResolved => {
  const resolved: LegacyResolved = async <TData = unknown>(
    fn: () => TData,
    {
      fetchOptions,
      noCache = false, // prevent cache writes after fetch
      //nonSerializableVariables, // Ignored, object-hash can handle files
      onCacheData,
      onEmptyResolve,
      onNoCacheFound,
      onSelection,
      onSubscription,
      operationName,
      refetch = false, // prevent cache reads from selections
      retry = retryPolicy,
    }: LegacyResolveOptions<TData> = {}
  ) => {
    const { context, selections } = createResolver({
      cachePolicy: noCache ? 'no-store' : refetch ? 'no-cache' : 'default',
      operationName,
    });
    const unsubscribe = subscribeLegacySelections((selection, cache) => {
      context.select(selection, cache);
      onSelection?.(convertSelection(selection));
    });
    const resolutionCache = refetch ? cache : context.cache;
    const targetCaches = noCache
      ? [context.cache]
      : refetch
        ? [context.cache, cache]
        : [cache];
    const dataFn = () => {
      globalContext.cache = resolutionCache;

      try {
        return fn();
      } finally {
        globalContext.cache = cache;
      }
    };

    context.shouldFetch ||= noCache || refetch;

    const data = dataFn();

    unsubscribe();

    if (selections.size === 0) {
      if (onEmptyResolve) {
        onEmptyResolve();
      } else if (process.env.NODE_ENV !== 'production') {
        console.warn('[gqty] Warning! No data requested.');
      }

      return data;
    }

    if (!context.shouldFetch) {
      return data;
    }

    if (context.hasCacheHit) {
      if (onCacheData?.(data) === false) {
        return data;
      }
    } else {
      onNoCacheFound?.();
    }

    {
      // Subscriptions
      const unsubscribe = subscribeSelections(
        new Set([...selections].filter((s) => s.root.key === 'subscription')),
        ({ data, error, extensions }) => {
          if (data) {
            // Skip the error here, resolved uses callbacks.
            updateCaches([{ data, extensions }], targetCaches);
          }

          if (error) {
            onSubscription?.({
              type: 'with-errors',
              unsubscribe: async () => unsubscribe(),
              data: dataFn() ?? (data as TData) ?? undefined,
              error: GQtyError.create(error),
            });
          } else if (data) {
            onSubscription?.({
              type: 'data',
              unsubscribe: async () => unsubscribe(),
              data: dataFn() ?? (data as TData),
            });
          }
        },
        {
          cache,
          debugger: debug,
          fetchOptions: clientFetchOptions,
          operationName,
          onSubscribe() {
            onSubscription?.({
              type: 'start',
              unsubscribe: async () => unsubscribe(),
            });
          },
          onComplete() {
            onSubscription?.({
              type: 'complete',
              unsubscribe: async () => unsubscribe(),
            });
          },
        }
      );
    }

    // Queries and mutations
    await fetchSelections(
      new Set([...selections].filter((s) => s.root.key !== 'subscription')),
      {
        debugger: debug,
        fetchOptions: { fetcher, retryPolicy: retry, ...fetchOptions },
        operationName,
      }
    ).then(
      (results) => updateCaches(results, targetCaches),
      (error) => Promise.reject(GQtyError.create(error))
    );

    return dataFn();
  };

  return resolved;
};
