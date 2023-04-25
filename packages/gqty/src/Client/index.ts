import type { Client as SseClient } from 'graphql-sse';
import type { Client as WsClient } from 'graphql-ws';
import { createSchemaAccessor } from '../Accessor';
import { Cache } from '../Cache';
import { createPersistors, Persistors } from '../Cache/persistence';
import type { RetryOptions } from '../Error';
import type {
  GeneratedSchemaObject,
  QueryFetcher,
  ScalarsEnumsHash,
  Schema,
} from '../Schema';
import {
  createLegacyClient,
  LegacyClient,
  LegacyClientOptions,
} from './compat/client';
import { createLegacyQueryFetcher } from './compat/queryFetcher';
import { createLegacySubscriptionsClient } from './compat/subscriptionsClient';
import { createContext, CreateContextOptions } from './context';
import { createDebugger } from './debugger';
import { createResolvers, Resolvers } from './resolvers';

export { $meta } from '../Accessor';
export { getFields, prepass, selectFields } from '../Helpers';
export * as useMetaStateHack from '../Helpers/useMetaStateHack';
export { pick } from '../Utils';
export type {
  LegacyClientOptions as LegacyFetchers,
  LegacyHydrateCache,
  LegacyHydrateCacheOptions,
  LegacyInlineResolved,
  LegacyInlineResolveOptions,
  LegacyMutate,
  LegacyMutateHelpers,
  LegacyPrefetch,
  LegacyQueryFetcher,
  LegacyRefetch,
  LegacyResolved,
  LegacyResolveOptions,
  LegacySelection,
  LegacySubscribeEvents,
  LegacySubscriptionsClient,
  LegacyTrack,
  LegacyTrackCallInfo,
  LegacyTrackCallType,
  LegacyTrackOptions,
} from './compat/client';
export type { SchemaContext } from './context';
export type { DebugEvent } from './debugger';
export { fetchSelections, subscribeSelections } from './resolveSelections';

/** A generated schema type in it's most basic form */
export type BaseGeneratedSchema = {
  query: GeneratedSchemaObject;
  mutation?: GeneratedSchemaObject;
  subscription?: GeneratedSchemaObject;
};

export type SchemaObjectKeys<TSchema extends BaseGeneratedSchema> = Exclude<
  keyof TSchema,
  'query' | 'mutation' | 'subscription' | number | symbol
>;

export type SchemaObjects<TSchema extends BaseGeneratedSchema> = {
  [key in SchemaObjectKeys<TSchema>]: { __typename: key };
};

export type SubscriptionClient = SseClient | WsClient;

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

  /** Default retry strategy upon fetch failure, configurable on query level. */
  retryPolicy?: RetryOptions;

  /** Client implementation for GraphQL Subscriptions. */
  subscriber?: SubscriptionClient;
};

export type ClientOptions = {
  cache: Cache;
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

export type Client<TSchema extends BaseGeneratedSchema> = Persistors &
  Resolvers<TSchema> &
  LegacyClient<TSchema> & {
    /** Global cache accessors. */
    schema: TSchema;

    /** Subscribe to debug events, useful for logging. */
    subscribeDebugEvents: ReturnType<typeof createDebugger>['subscribe'];
  };

export const createClient = <
  TSchema extends BaseGeneratedSchema,
  // TODO: compat: remove in v4
  _ObjectTypesNames extends string = never,
  // TODO: compat: remove in v4
  _ObjectTypes extends SchemaObjects<TSchema> = never
>({
  // This default cache on a required option is for legacy clients, which does
  // not provide a `cache` option.
  // TODO: compat: remove in v4
  cache = new Cache(undefined, { normalization: true }),
  fetchOptions: {
    fetcher,
    cachePolicy: fetchPolicy = 'default',
    retryPolicy: defaultRetryPolicy = {
      maxRetries: 3,
      retryDelay: 1000,
    },
    subscriber,
    ...fetchOptions
  } = {} as FetchOptions,
  scalars,
  schema,
  __depthLimit = 15,
  ...legacyOptions
}: ClientOptions & LegacyClientOptions): Client<TSchema> => {
  // TODO: compat: remove in next major
  {
    if (legacyOptions.queryFetcher) {
      fetcher ??= createLegacyQueryFetcher(legacyOptions.queryFetcher);
    }

    if (legacyOptions.subscriptionsClient) {
      subscriber ??= createLegacySubscriptionsClient(
        legacyOptions.subscriptionsClient
      );
    }

    if (legacyOptions.scalarsEnumsHash) {
      scalars ??= legacyOptions.scalarsEnumsHash;
    }
  }

  // TODO: Defer creation until `@gqty/logger` is used.
  const debug = createDebugger();

  const defaultContextOptions: CreateContextOptions = {
    cache,
    depthLimit: __depthLimit,
    cachePolicy: fetchPolicy,
    scalars,
    schema,
    typeKeys: cache.normalizationOptions?.schemaKeys,
  };

  // Global scope for accessing the cache via `schema` property.
  const clientContext = createContext(defaultContextOptions);

  const resolvers = createResolvers<TSchema>({
    scalars,
    schema,
    cache,
    debugger: debug,
    fetchOptions: {
      fetcher,
      cachePolicy: fetchPolicy,
      retryPolicy: defaultRetryPolicy,
      subscriber,
      ...fetchOptions,
    },
    depthLimit: __depthLimit,
    parentContext: clientContext,
  });

  const accessor = createSchemaAccessor<TSchema>(clientContext);

  return {
    ...resolvers,
    schema: accessor,
    subscribeDebugEvents: debug.subscribe,
    ...createPersistors(cache),

    ...createLegacyClient({
      accessor,
      cache,
      context: clientContext,
      debugger: debug,
      fetchOptions: {
        fetcher,
        cachePolicy: fetchPolicy,
        retryPolicy: defaultRetryPolicy,
        subscriber,
        ...fetchOptions,
      },
      scalars,
      schema,
      resolvers,
      __depthLimit,
    }),
  };
};
