import type { BaseGeneratedSchema, Client, RetryOptions } from 'gqty';
import { createMutation, type CreateMutation } from './mutation';
import { createQuery, type CreateQuery } from './query';
import { createSubscription, type CreateSubscription } from './subscription';

export type ArrowFunction = (...args: unknown[]) => unknown;

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

export type CommonOptions = {
  /** Custom GraphQL extensions to be exposed to the query fetcher. */
  extensions?: Record<string, unknown>;
  /**
   * Specify a custom GraphQL operation name in the query. This separates the
   * query from the internal query batcher, resulting a standalone fetch for
   * easier debugging.
   */
  operationName?: string;
};

export type SolidClientOptions = {
  defaults?: Partial<DefaultOptions>;
};

export type SolidClient<Schema extends BaseGeneratedSchema> = {
  createQuery: CreateQuery<Schema>;
  createMutation: CreateMutation<Schema>;
  createSubscription: CreateSubscription<Schema>;
};

// Export the types to prevent tsc from removing the imports
export type { BaseGeneratedSchema, Client };

export const createSolidClient = <Schema extends BaseGeneratedSchema>(
  client: Client<Schema>,
  options?: SolidClientOptions
): SolidClient<Schema> => {
  return {
    createQuery: createQuery(client, options),
    createMutation: createMutation(client, options),
    createSubscription: createSubscription(client, options),
  };
};
