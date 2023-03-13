import type { Client as SseClient } from 'graphql-sse';
import type {
  Client as WsClient,
  ExecutionResult,
  Sink,
  SubscribePayload,
} from 'graphql-ws';
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
import {
  createLegacyClient,
  LegacyClient,
  LegacyFetchers,
} from './compat/client';
import { createContext, CreateContextOptions } from './context';
import { createDebugger } from './debugger';
import { createResolvers, Resolvers } from './resolvers';

export { $meta } from '../Accessor';
export { getFields, prepass, selectFields } from '../Helpers';
export * as useMetaStateHack from '../Helpers/useMetaStateHack';
export { pick } from '../Utils';
export type {
  LegacyFetchers,
  LegacyHydrateCache,
  LegacyHydrateCacheOptions,
  LegacyInlineResolved,
  LegacyInlineResolveOptions,
  LegacyMutate,
  LegacyMutateHelpers,
  LegacyPrefetch,
  LegacyRefetch,
  LegacyResolved,
  LegacyResolveOptions,
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
  subscriber?: SubscriptionClient;
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

export type Client<
  TSchema extends BaseGeneratedSchema,
  // TODO: compat: remove in next major
  _ObjectTypesNames extends string = never,
  // TODO: compat: remove in next major
  _ObjectTypes extends Record<string, unknown> = never
> = Persistors &
  Resolvers<TSchema> &
  LegacyClient<TSchema> & {
    /** Global cache accessors. */
    schema: TSchema;

    /** Subscribe to debug events, useful for logging. */
    subscribeDebugEvents: ReturnType<typeof createDebugger>['subscribe'];
  };

export const createClient = <TSchema extends BaseGeneratedSchema>({
  cacheOptions: {
    maxAge = 100,
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

  queryFetcher,
  subscriptionClient,
}: ClientOptions & LegacyFetchers): Client<TSchema> => {
  // TODO: compat: queryFetcher, remove in next major
  fetcher ||= ({ query, variables }, fetchOptions) =>
    queryFetcher!(query, variables ?? {}, fetchOptions);

  // TODO: compat: subscriptionsClient, remove in next major
  subscriber ||= {
    subscribe<
      TData = Record<string, unknown>,
      TExtensions = Record<string, unknown>
    >(
      { query, variables }: SubscribePayload,
      sink: Sink<ExecutionResult<TData, TExtensions>>
    ) {
      const maybePromise = subscriptionClient!.subscribe({
        query,
        variables: variables ?? {},
        selections: [],
        events: {
          onComplete: () => {
            sink.complete();
          },
          onData: (result) => {
            sink.next(result);
          },
          onError({ data, error }) {
            if ((error && !error.graphQLErrors?.length) || !data) {
              sink.error(error);
            } else {
              sink.next({ data: data as TData, errors: error.graphQLErrors });
            }
          },
        },
      });

      return () => {
        if (maybePromise instanceof Promise) {
          maybePromise.then(({ unsubscribe }) => {
            unsubscribe();
          });
        } else {
          (maybePromise as any).unsubscribe();
        }
      };
    },
    dispose: () => {
      subscriptionClient?.close();
    },
    terminate: () => {
      subscriptionClient?.close();
    },
    on: () => () => {},
  };

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

  // TODO: Defer creation until `@gqty/logger` is used.
  const debug = createDebugger();

  const defaultContextOptions: CreateContextOptions = {
    cache: clientCache,
    depthLimit: __depthLimit,
    fetchPolicy,
    scalars,
    schema,
    typeKeys: normalizationOptions?.schemaKeys,
  };

  // Global scope for accessing the cache via `schema` property.
  const clientContext = createContext(defaultContextOptions);

  const resolvers = createResolvers<TSchema>({
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
    parentContext: clientContext,
  });

  const accessor = createSchemaAccessor<TSchema>(clientContext);

  return {
    ...resolvers,
    schema: accessor,
    subscribeDebugEvents: debug.subscribe,
    ...createPersistors(clientCache),

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
      scalars,
      schema,
      resolvers,
      __depthLimit,
    }),
  };
};
