import { Cache, CacheDataContainer, CacheGetOptions } from '../Cache';
import type { ScalarsEnumsHash, Schema } from '../Schema';
import type { Selection } from '../Selection';
import type { ResolveOptions } from './resolvers';

export type ResolveContext = SchemaContext<{
  notifyCacheUpdate: boolean;
  shouldFetch: boolean;
}>;

export type SchemaContext<
  T extends Record<string, unknown> = Record<string, unknown>
> = T & {
  cache: Cache;
  readonly cacheOptions?: CacheGetOptions;
  readonly scalars: ScalarsEnumsHash;
  /** Root schema for type lookups */
  readonly schema: Readonly<Schema>;
  /** Custom key fields for each object type. */
  readonly typeKeys?: Record<string, string[]>;
  readonly depthLimit: number;

  onSelect?: (selection: Selection, cache?: CacheDataContainer) => void;
};

export type CreateContextOptions = {
  cache: Cache;
  depthLimit: number;
  fetchPolicy: ResolveOptions['fetchPolicy'];
  onSelect?: NonNullable<ResolveContext['onSelect']>;
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
}: CreateContextOptions): ResolveContext => ({
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
  onSelect(selection, cacheNode) {
    const now = Date.now();
    const { data, expiresAt: age = Infinity } = cacheNode ?? {};

    // Suggest a fetch on a stale or missing cache.
    this.shouldFetch ||= data === undefined || age < now;

    // Missing cache always notify on cache updates.
    // The only case we skip this is when fetching for SWR on 'default'.
    this.notifyCacheUpdate ||= data === undefined;

    onSelect?.(selection, cacheNode);
  },
  notifyCacheUpdate: fetchPolicy !== 'default',
  shouldFetch: false,
  typeKeys,
});
