import {
  AssignSelections,
  createAccessorCreators,
  createSchemaUnions,
  SchemaUnions,
  SetCache,
} from '../Accessor';
import {
  AccessorCache,
  CacheInstance,
  CacheType,
  createAccessorCache,
  createCache,
} from '../Cache';
import {
  createPersistenceHelpers,
  PersistenceHelpers,
} from '../Cache/persistence';
import { GQtyError } from '../Error';
import { EventHandler } from '../Events';
import { createPrefetch, Prefetch } from '../Helpers/prefetch';
import { createRefetch, Refetch } from '../Helpers/refetch';
import { createSSRHelpers, HydrateCache, PrepareRender } from '../Helpers/ssr';
import { createTracker, Track } from '../Helpers/track';
import { createInterceptorManager, InterceptorManager } from '../Interceptor';
import {
  createNormalizationHandler,
  NormalizationHandler,
  NormalizationOptions,
} from '../Normalization';
import { createScheduler, Scheduler } from '../Scheduler';
import type { QueryFetcher, ScalarsEnumsHash, Schema } from '../Schema/types';
import type { Selection } from '../Selection/selection';
import {
  createSelectionManager,
  SelectionManager,
} from '../Selection/SelectionManager';
import {
  BuildAndFetchSelections,
  createResolvers,
  InlineResolved,
  Resolved,
  Resolvers,
  RetryOptions,
} from './resolvers';

export interface InnerClientState {
  allowCache: boolean;
  foundValidCache: boolean;
  clientCache: CacheInstance;
  selectionManager: SelectionManager;
  readonly accessorCache: AccessorCache;
  readonly interceptorManager: InterceptorManager;
  readonly scheduler: Scheduler;
  readonly eventHandler: EventHandler;
  readonly schema: Readonly<Schema>;
  readonly scalarsEnumsHash: Readonly<ScalarsEnumsHash>;
  readonly queryFetcher: QueryFetcher;
  readonly schemaUnions: SchemaUnions;
  readonly normalizationHandler: NormalizationHandler | undefined;
  readonly depthLimit: number;
  defaults: CoreClientDefaults;
}

export interface SubscribeEvents {
  onData: (data: Record<string, unknown>) => void;
  onError: (payload: {
    error: GQtyError;
    data: Record<string, unknown> | null;
  }) => void;
  onStart?: () => void;
  onComplete?: () => void;
}

export type PossiblePromise<T> = Promise<T> | T;

export interface SubscriptionsClient {
  subscribe(opts: {
    query: string;
    variables: Record<string, unknown> | undefined;
    selections: Selection[];
    events:
      | ((ctx: {
          selections: Selection[];
          query: string;
          variables: Record<string, unknown> | undefined;
          operationId: string;
        }) => SubscribeEvents)
      | SubscribeEvents;
    cacheKey?: string;
  }): PossiblePromise<{
    unsubscribe: () => Promise<void>;
    operationId: string;
  }>;
  unsubscribe(selections: Selection[] | Set<Selection>): Promise<string[]>;
  close(): Promise<void>;
  setConnectionParams(
    connectionParams:
      | (() => PossiblePromise<Record<string, unknown>>)
      | Record<string, unknown>,
    restartClient?: boolean
  ): void;
}

export interface CoreClientDefaults {
  /**
   * `resolved` defaults
   */
  resolved?: {
    /**
     * Set the default `noCache` option
     *
     * @default false
     */
    noCache?: boolean;
    /**
     * Set the default `noCache` option
     *
     * @default false
     */
    refetch?: boolean;
    /**
     * Set the default `retry` strategy
     *
     * @default false
     */
    retry?: RetryOptions;
  };
}

export interface ClientOptions<
  ObjectTypesNames extends string = never,
  SchemaObjectTypes extends {
    [P in ObjectTypesNames]: {
      __typename?: P;
    };
  } = never
> {
  schema: Readonly<Schema>;
  scalarsEnumsHash: ScalarsEnumsHash;
  queryFetcher: QueryFetcher;
  catchSelectionsTimeMS?: number;
  retry?: RetryOptions;
  normalization?:
    | NormalizationOptions<ObjectTypesNames, SchemaObjectTypes>
    | boolean;
  subscriptionsClient?: SubscriptionsClient;
  defaults?: CoreClientDefaults;
  /**
   * Set the maximum depth limit, needed to prevent possible infinite recursion.
   *
   * After the specified depth is reached, the proxy creation is stopped returning `null`
   *
   * @default 15
   */
  depthLimit?: number;
}

export interface MutateHelpers<
  GeneratedSchema extends {
    query: {};
  }
> {
  query: GeneratedSchema['query'];
  setCache: SetCache;
  assignSelections: AssignSelections;
}

export interface Mutate<
  GeneratedSchema extends {
    query: {};
    mutation: {};
  }
> {
  <T = any>(
    fn: (mutation: GeneratedSchema['mutation']) => T,
    opts?: {
      onComplete?: (data: T, helpers: MutateHelpers<GeneratedSchema>) => void;
      onError?: (
        error: GQtyError,
        helpers: MutateHelpers<GeneratedSchema>
      ) => void;
    }
  ): Promise<T>;
}

export interface GQtyClient<
  GeneratedSchema extends {
    query: object;
    mutation: object;
    subscription: object;
  }
> extends PersistenceHelpers {
  query: GeneratedSchema['query'];
  mutation: GeneratedSchema['mutation'];
  subscription: GeneratedSchema['subscription'];
  resolved: Resolved;
  inlineResolved: InlineResolved;
  cache: CacheType;
  interceptorManager: InterceptorManager;
  scheduler: Scheduler;
  refetch: Refetch;
  accessorCache: AccessorCache;
  buildAndFetchSelections: BuildAndFetchSelections;
  eventHandler: EventHandler;
  setCache: SetCache;
  hydrateCache: HydrateCache;
  prepareRender: PrepareRender;
  assignSelections: AssignSelections;
  mutate: Mutate<GeneratedSchema>;
  subscriptionsClient: SubscriptionsClient | undefined;
  prefetch: Prefetch<GeneratedSchema>;
  track: Track;
}

export type {
  Resolved,
  CacheType,
  InterceptorManager,
  Scheduler,
  Refetch,
  AccessorCache,
  Resolvers,
  EventHandler,
  SetCache,
  HydrateCache,
  PrepareRender,
  AssignSelections,
  Prefetch,
  BuildAndFetchSelections,
  InlineResolved,
};

export function createClient<
  GeneratedSchema extends {
    query: {};
    mutation: {};
    subscription: {};
  } = never,
  ObjectTypesNames extends string = never,
  ObjectTypes extends {
    [P in ObjectTypesNames]: {
      __typename?: P;
    };
  } = never
>({
  schema,
  scalarsEnumsHash,
  queryFetcher,
  catchSelectionsTimeMS = 10,
  retry,
  normalization = true,
  subscriptionsClient,
  defaults = {},
  depthLimit = 15,
}: ClientOptions<ObjectTypesNames, ObjectTypes>): GQtyClient<GeneratedSchema> {
  const interceptorManager = createInterceptorManager();

  const { globalInterceptor } = interceptorManager;

  const accessorCache = createAccessorCache();

  const eventHandler = new EventHandler();

  const normalizationHandler = createNormalizationHandler(
    normalization,
    eventHandler,
    schema,
    scalarsEnumsHash
  );

  const clientCache = createCache(normalizationHandler);

  const selectionManager = createSelectionManager();

  const scheduler = createScheduler(
    interceptorManager,
    resolveSchedulerSelections,
    catchSelectionsTimeMS
  );

  const innerState: InnerClientState = {
    allowCache: true,
    foundValidCache: true,
    clientCache,
    accessorCache,
    selectionManager,
    interceptorManager,
    schema,
    scalarsEnumsHash,
    scheduler,
    eventHandler,
    queryFetcher,
    schemaUnions: createSchemaUnions(schema),
    normalizationHandler,
    defaults,
    depthLimit,
  };

  const {
    resolved,
    buildAndFetchSelections,
    resolveSelections,
    inlineResolved,
  } = createResolvers(innerState, catchSelectionsTimeMS, subscriptionsClient);

  async function resolveSchedulerSelections(selections: Set<Selection>) {
    const resolvingPromise = scheduler.resolving;

    const resolvePromise = resolveSelections(selections, undefined, {
      retry: retry === undefined ? true : retry,
      scheduler: true,
    });

    globalInterceptor.removeSelections(selections);
    try {
      await resolvePromise;
    } catch (error: any) {
      /* istanbul ignore else */
      if (resolvingPromise) {
        resolvingPromise.resolve({
          error,
          selections,
        });
      }
    }
  }

  const refetch = createRefetch(innerState, resolveSelections, inlineResolved);

  const { query, mutation, subscription, setCache, assignSelections } =
    createAccessorCreators<GeneratedSchema>(innerState);

  const ssrHelpers = createSSRHelpers({
    innerState,
    query,
    refetch,
  });

  async function mutate<T = any>(
    fn: (mutation: GeneratedSchema['mutation']) => T,
    opts: {
      onComplete?: (
        data: T,
        helpers: {
          query: GeneratedSchema['query'];
          setCache: typeof setCache;
          assignSelections: typeof assignSelections;
        }
      ) => void;
      onError?: (
        error: GQtyError,
        helpers: {
          query: GeneratedSchema['query'];
          setCache: typeof setCache;
          assignSelections: typeof assignSelections;
        }
      ) => void;
    } = {}
  ): Promise<T> {
    try {
      const data = await resolved<T>(() => fn(mutation), {
        refetch: true,
      });
      opts.onComplete?.(data, {
        query,
        setCache,
        assignSelections,
      });
      return data;
    } catch (err) {
      const error = GQtyError.create(err, mutate);

      opts.onError?.(error, {
        query,
        setCache,
        assignSelections,
      });

      throw error;
    }
  }

  const prefetch = createPrefetch<GeneratedSchema>(query, innerState);

  const persistenceHelpers = createPersistenceHelpers(
    clientCache,
    selectionManager
  );

  const tracker = createTracker(innerState, subscriptionsClient);

  return {
    query,
    mutation,
    subscription,
    resolved,
    inlineResolved,
    cache: innerState.clientCache.cache,
    interceptorManager,
    scheduler,
    refetch,
    accessorCache,
    buildAndFetchSelections,
    eventHandler,
    setCache,
    ...ssrHelpers,
    assignSelections,
    mutate,
    subscriptionsClient,
    prefetch,
    ...persistenceHelpers,
    ...tracker,
  };
}
