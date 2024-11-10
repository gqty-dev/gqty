import type { ExecutionResult } from 'graphql';
import type { Cache } from '.';

/** Global query deduplication when cache instance is not provided. */
const nullObjectKey = {};

const deduplicationCache = new WeakMap<
  Cache | typeof nullObjectKey,
  Map<string, Promise<ExecutionResult>>
>([[nullObjectKey, new Map()]]);

/**
 * Keep track of ongoing promises, identified by a provided hash.
 *
 * Before the promise is resolved, subsequent requests with the same hash
 * gets the same promise.
 *
 * After promise resolution, the hash is removed from the map.
 *
 * If the `cache` argument is omitted, a global cache will be used instead.
 */
export const dedupePromise = <
  TData = Record<string, unknown>,
  TExtensions = Record<string, unknown>,
>(
  cache: Cache | undefined,
  hash: string,
  fetchOrSubscribe: () => Promise<ExecutionResult<TData, TExtensions> | void>
): Promise<ExecutionResult<TData, TExtensions>> => {
  const key = cache ?? nullObjectKey;

  const queryHashMap = deduplicationCache.get(key) ?? new Map();
  if (!deduplicationCache.has(key)) {
    deduplicationCache.set(key, queryHashMap);
  }

  const cachedQueryPromise =
    queryHashMap.get(hash) ??
    fetchOrSubscribe().finally(() => {
      queryHashMap.delete(hash);
    });

  if (!queryHashMap.has(hash)) {
    queryHashMap.set(hash, cachedQueryPromise);
  }

  return cachedQueryPromise;
};

/** Retrieve active promises associated provided cache, useful for SSR. */
export const getActivePromises = (
  cache?: Cache
): Promise<ExecutionResult>[] => [
  ...(deduplicationCache.get(cache ?? nullObjectKey)?.values() ?? []),
];
