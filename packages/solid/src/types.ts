import type { BaseGeneratedSchema, RetryOptions, prepass } from 'gqty';
import type { Accessor } from 'solid-js';

export type DefaultOptions = {
  /**
   * Defines how a query should fetch from the cache and network.
   *
   * - `default`: Serves the cached contents when it is fresh, and if they are
   * stale within `staleWhileRevalidate` window, fetches in the background and
   * updates the cache. Or simply fetches on stale cache or cache miss. During
   * SWR, a successful fetch will not notify cache updates. New contents are
   * served on next query.
   * - `no-store`: Always fetch and does not update on response.
   * GQty creates a temporary cache at query-level which immediately expires.
   * - `reload`: Always fetch, updates on response.
   * - `no-cache`: Same as `reload`, for GraphQL does not support conditional
   * requests.
   * - `force-cache`: Serves the cached contents regardless of staleness. It
   * fetches on cache miss or a stale cache, updates cache on response.
   * - `only-if-cached`: Serves the cached contents regardless of staleness,
   * throws a network error on cache miss.
   *
   * _It takes effort to make sure the above stays true for all supported
   * frameworks, please consider sponsoring so we can dedicate even more time on
   * this._
   */
  cachePolicy?: RequestCache;
  /** Retry strategy upon fetch failure. */
  retryPolicy?: RetryOptions;
};

export type SolidClientOptions = {
  defaults?: Partial<DefaultOptions>;
};

export type PrepareQueryHelpers<Schema extends BaseGeneratedSchema> = {
  prepass: typeof prepass<Schema>;
};

export type CreateQueryOptions<Schema extends BaseGeneratedSchema> =
  DefaultOptions & {
    /** Custom GraphQL extensions to be exposed to the query fetcher. */
    extensions?: Record<string, unknown>;
    /**
     * Specify a custom GraphQL operation name in the query. This separates the
     * query from the internal query batcher, resulting a standalone fetch for
     * easier debugging.
     */
    operationName?: string;
    /**
     * Making selections before the component is rendered, allowing Suspense
     * to happen during first render.
     */
    prepare?: (schema: Schema, helpers?: PrepareQueryHelpers<Schema>) => void;
    /**
     * Soft refetches on the specified interval, skip this option to disable.
     */
    refetchInterval?: number;
  };

export type CreateQuery<Schema extends BaseGeneratedSchema> = (
  options?: CreateQueryOptions<Schema>
) => Readonly<{
  schema: Accessor<Schema>;
  $refetch: (
    /**
     * Refetch even if the current cache is still fresh.
     *
     * @default true
     */
    ignoreCache?: boolean
  ) => Promise<void>;
  debug?: (...args: any[]) => any;
}>;

export type SolidClient<Schema extends BaseGeneratedSchema> = {
  createQuery: CreateQuery<Schema>;
};
