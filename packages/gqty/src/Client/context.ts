import { Cache, type CacheGetOptions } from '../Cache';
import type { Disposable } from '../Disposable';
import type { Resetable } from '../Resetable';
import type { ScalarsEnumsHash, Schema } from '../Schema';
import type { Selectable } from '../Selectable';

export type SchemaContext<
  T extends Record<string, unknown> = Record<string, unknown>,
> = T &
  Disposable &
  Resetable &
  Selectable & {
    cache: Cache;
    readonly aliasLength?: number;
    readonly cacheOptions?: CacheGetOptions;
    readonly depthLimit: number;
    readonly scalars: ScalarsEnumsHash;
    /** Root schema for type lookups */
    readonly schema: Readonly<Schema>;
    /** Custom key fields for each object type. */
    readonly typeKeys?: Record<string, string[]>;
    notifyCacheUpdate: boolean;
    shouldFetch: boolean;
    hasCacheHit: boolean;
    /**
     * Useful for identifying SWR fetches where
     * `shouldFetch` is true and `hasCacheHit` is false.
     */
    hasCacheMiss: boolean;
    /**
     * When > 0, enumeration-based access (spread, for...in, Object.keys, etc.)
     * will enumerate all schema fields. When 0 (default), only cached fields
     * are returned during enumeration. This prevents React 19's prop diffing
     * from selecting all fields while allowing helpers like selectFields() to
     * work correctly.
     *
     * Using a counter instead of boolean allows re-entrant/nested helper calls.
     */
    activeEnumerators: number;
  };

export type CreateContextOptions = {
  aliasLength?: number;
  cache: Cache;
  depthLimit: number;
  cachePolicy: RequestCache;
  scalars: ScalarsEnumsHash;
  schema: Readonly<Schema>;
  typeKeys?: Record<string, string[]>;
};

export const createContext = ({
  aliasLength,
  cache,
  cachePolicy,
  depthLimit,
  scalars,
  schema,
  typeKeys,
}: CreateContextOptions): SchemaContext => {
  const disposeSubscriptions = new Set<() => void>();
  const selectSubscriptions = new Set<Selectable['select']>();

  return {
    activeEnumerators: 0,
    aliasLength,
    cache:
      cachePolicy === 'no-cache' ||
      cachePolicy === 'no-store' ||
      cachePolicy === 'reload'
        ? new Cache(undefined, { maxAge: 0 })
        : cache,
    cacheOptions: {
      includeExpired:
        cachePolicy === 'default' ||
        cachePolicy === 'force-cache' ||
        cachePolicy === 'only-if-cached',
    },
    scalars,
    schema,
    depthLimit,
    hasCacheHit: false,
    hasCacheMiss: false,
    shouldFetch: false,
    notifyCacheUpdate: cachePolicy !== 'default',
    select(selection, cacheNode) {
      const now = Date.now();
      const { data, expiresAt: age = Infinity } = cacheNode ?? {};

      if (cacheNode) {
        // Suggests a fetch on a stale or missing cache.
        this.shouldFetch ||=
          data === undefined ||
          // Add 100 ms leeway to avoiding infinite fetch loops for caches with
          // immedidate staleness.
          age < now;
        this.hasCacheHit ||= data !== undefined;

        // Missing cache always notify on cache updates.
        // The only case we skip this is when fetching for SWR on 'default'.
        this.notifyCacheUpdate ||= data === undefined;
      }

      this.hasCacheMiss ||= cacheNode?.data === undefined;

      selectSubscriptions.forEach((fn) => fn(selection, cacheNode));
    },
    reset() {
      this.activeEnumerators = 0;
      this.hasCacheHit = false;
      this.hasCacheMiss = false;
      this.notifyCacheUpdate = cachePolicy !== 'default';
      this.shouldFetch = false;
    },
    subscribeSelect(callback) {
      selectSubscriptions.add(callback);

      return () => {
        selectSubscriptions.delete(callback);
      };
    },
    dispose() {
      disposeSubscriptions.forEach((fn) => fn());
      disposeSubscriptions.clear();
      selectSubscriptions.clear();
    },
    subscribeDispose(callback) {
      disposeSubscriptions.add(callback);

      return () => {
        disposeSubscriptions.delete(callback);
      };
    },
    typeKeys,
  };
};
