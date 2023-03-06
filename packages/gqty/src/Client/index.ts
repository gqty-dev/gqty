import type { Client as SubscriptionsClient } from 'graphql-ws';
import { createSchemaAccessor } from '../Accessor';
import { Cache } from '../Cache';
import {
  CacheNormalizationHandler,
  defaultNormalizationHandler as defaultNormalizationOptions,
} from '../Cache/normalization';
import { createPersistors, Persistors } from '../Cache/persistence';
import type { RetryOptions } from '../Error';
import type {
  GeneratedSchemaObject,
  QueryFetcher,
  ScalarsEnumsHash,
  Schema,
} from '../Schema';
import { createLegacyClient, LegacyClient } from './compat/client';
import { createContext } from './context';
import { createDebugger } from './debugger';
import { createResolvers, ResolveFn, SubscribeFn } from './resolvers';

export type { ResolveContext, SchemaContext } from './context';
export type { DebugEvent } from './debugger';

/** A generated schema type in it's most basic form */
export type BaseGeneratedSchema = {
  query: GeneratedSchemaObject;
  mutation?: GeneratedSchemaObject;
  subscription?: GeneratedSchemaObject;
  [key: string]: GeneratedSchemaObject | undefined;
};

export type SchemaObjectKeys<TSchema extends BaseGeneratedSchema> = Exclude<
  keyof TSchema,
  'query' | 'mutation' | 'subscription' | number | symbol
>;

export type SchemaObjects<TSchema extends BaseGeneratedSchema> = {
  [key in SchemaObjectKeys<TSchema>]: { __typename: key };
};

export type FetchOptions = Omit<RequestInit, 'body' | 'mode'> & {
  fetcher: QueryFetcher;

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
   * - `no-cache`: Always fetch, updates on response.
   * - `force-cache`: Serves the cached contents regardless of staleness. It
   * fetches on cache miss or a stale cache, updates cache on response.
   * - `only-if-cached`: Serves the cached contents regardless of staleness,
   * throws a network error on cache miss.
   *
   * _It takes effort to make sure the above stays true for all supported
   * frameworks, please consider sponsoring so we can dedicate even more time on
   * this._
   */
  fetchPolicy?: Exclude<RequestCache, 'reload'> | 'cache-and-network';

  /** Default retry strategy upon fetch failure, configurable on query level. */
  retryPolicy?: RetryOptions;

  /** Client implementation for GraphQL Subscriptions. */
  subscriber?: SubscriptionsClient;
};

export type ClientOptions = {
  /**
   * Default cache options is an immediate expiry with a 5 minutes window of
   * stale-while-revalidate.
   */
  cacheOptions?: {
    maxAge?: number;
    staleWhileRevalidate?: number;
    /**
     * `false` to disable normalized cache, which usually means manual
     * refetching after mutations.
     */
    normalization?: boolean | CacheNormalizationHandler;
  };
  fetchOptions: FetchOptions;
  scalars: ScalarsEnumsHash;
  schema: Readonly<Schema>;

  /**
   * Maximum accessor depth, prevents infinite recursions.
   *
   * @default 15
   */
  __depthLimit?: number;
};

export type Client<TSchema extends BaseGeneratedSchema> = Persistors & {
  /**
   * Query, mutation and subscription in a promise.
   *
   * Selections to queries and mutations are fetched with
   * `fetchOptions.fetcher`, the result is resolved with the cache updated
   * according to the current fetch policy
   *
   * Subscriptions are disconnected upon delivery of the first data message,
   * the cache is updated and the data is resolved, essentially behaving like
   * a promise.
   */
  resolve: ResolveFn<TSchema>;

  /**
   * Query, mutation and subscription in an async generator.
   *
   * Subscription data continuously update the cache, while queries and
   * mutations are fetched once and then listen to future cache changes
   * from the same selections.
   *
   * This function subscribes to *cache changes*, termination of underlying
   * subscription (WebSocket/EventSource) does not stop this generator.
   *
   * Calling `.return()` does not terminate pending promise. Use the `signal`
   * option to exist the generator without waiting for the next update.
   */
  subscribe: SubscribeFn<TSchema>;

  schema: TSchema;

  /** Subscribe to debug events, useful for logging. */
  subscribeDebugEvents: ReturnType<typeof createDebugger>['subscribe'];
};

export const createClient = <TSchema extends BaseGeneratedSchema>({
  cacheOptions: {
    maxAge = 0,
    normalization = true,
    staleWhileRevalidate = 5 * 60 * 1000,
  } = {},
  fetchOptions: {
    fetcher,
    fetchPolicy = 'default',
    retryPolicy: defaultRetryPolicy = {
      maxRetries: 3,
      retryDelay: 1000,
    },
    subscriber,
    ...fetchOptions
  },
  scalars,
  schema,
  __depthLimit = 15,
}: ClientOptions): Client<TSchema> & LegacyClient<TSchema> => {
  const normalizationOptions =
    normalization === true
      ? defaultNormalizationOptions
      : normalization === false
      ? undefined
      : normalization;

  const clientCache = new Cache(undefined, {
    maxAge,
    normalization: normalizationOptions,
    staleWhileRevalidate,
  });

  const debug = createDebugger();

  const { resolve, subscribe } = createResolvers<TSchema>({
    scalars,
    schema,
    cache: clientCache,
    debugger: debug,
    fetchOptions: {
      fetcher,
      fetchPolicy,
      retryPolicy: defaultRetryPolicy,
      subscriber,
      ...fetchOptions,
    },
    depthLimit: __depthLimit,
  });

  /** For cache accessors outside of resolver scopes. */
  const clientContext = createContext({
    cache: clientCache,
    depthLimit: __depthLimit,
    fetchPolicy,
    scalars,
    schema,
    typeKeys: normalizationOptions?.schemaKeys,
  });

  const accessor = createSchemaAccessor<TSchema>(clientContext);

  return {
    resolve,
    subscribe,
    schema: accessor,

    ...createPersistors(clientCache),

    subscribeDebugEvents: debug.subscribe,

    ...createLegacyClient({
      accessor,
      cache: clientCache,
      context: clientContext,
      debugger: debug,
      fetchOptions: {
        fetcher,
        fetchPolicy,
        retryPolicy: defaultRetryPolicy,
        subscriber,
        ...fetchOptions,
      },
      resolve,
      scalars,
      schema,
      subscribe,
      __depthLimit,
    }),
  };
};

// TODO: Update fetcher in cli codegen to accept QueryPayload
