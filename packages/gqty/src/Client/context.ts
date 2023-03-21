import { Cache, CacheDataContainer, CacheGetOptions } from '../Cache';
import type { ScalarsEnumsHash, Schema } from '../Schema';
import type { Selection } from '../Selection';
import type { ResolveOptions } from './resolvers';

export type SchemaContext<
  T extends Record<string, unknown> = Record<string, unknown>
> = T & {
  cache: Cache;
  readonly cacheOptions?: CacheGetOptions;
  readonly depthLimit: number;
  readonly scalars: ScalarsEnumsHash;
  /** Root schema for type lookups */
  readonly schema: Readonly<Schema>;
  /** Custom key fields for each object type. */
  readonly typeKeys?: Record<string, string[]>;
  onSelect: (selection: Selection, cache?: CacheDataContainer) => void;
  notifyCacheUpdate: boolean;
  shouldFetch: boolean;
  hasCacheHit: boolean;
  hasCacheMiss: boolean;
};

export type CreateContextOptions = {
  cache: Cache;
  depthLimit: number;
  fetchPolicy: ResolveOptions['fetchPolicy'];
  onSelect?: NonNullable<SchemaContext['onSelect']>;
  scalars: ScalarsEnumsHash;
  schema: Readonly<Schema>;
  typeKeys?: Record<string, string[]>;
};

export const createContext = ({
  cache,
  depthLimit,
  fetchPolicy,
  onSelect,
  scalars,
  schema,
  typeKeys,
}: CreateContextOptions): SchemaContext => ({
  cache:
    fetchPolicy === 'no-cache' || fetchPolicy === 'no-store'
      ? new Cache()
      : cache,
  cacheOptions: {
    includeExpired:
      fetchPolicy === 'default' ||
      fetchPolicy === 'force-cache' ||
      fetchPolicy === 'only-if-cached',
  },
  scalars,
  schema,
  depthLimit,
  hasCacheHit: false,
  hasCacheMiss: false,
  shouldFetch: false,
  notifyCacheUpdate: fetchPolicy !== 'default',
  onSelect(selection, cacheNode) {
    const now = Date.now();
    const { data, expiresAt: age = Infinity } = cacheNode ?? {};

    // Suggests a fetch on a stale or missing cache.
    //
    // We add a minimum of 100 ms delay for caches with immedidate staleness,
    // this prevents components from infinite rendering loop.
    this.shouldFetch ||= data === undefined || age < now - 100;
    this.hasCacheHit ||= data !== undefined;

    // Missing cache always notify on cache updates.
    // The only case we skip this is when fetching for SWR on 'default'.
    this.notifyCacheUpdate ||= data === undefined;

    onSelect?.(selection, cacheNode);
  },
  typeKeys,
});
