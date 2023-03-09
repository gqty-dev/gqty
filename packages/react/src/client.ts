import { $meta, BaseGeneratedSchema, GQtyClient, RetryOptions } from 'gqty';
import { getActivePromises } from 'gqty/Cache/query';
import type { LegacyFetchPolicy } from './common';
import { createUseMetaState, UseMetaState } from './meta/useMetaState';
import { createUseMutation, UseMutation } from './mutation/useMutation';
import { createGraphqlHOC, GraphQLHOC } from './query/hoc';
import { createPrepareQuery, PrepareQuery } from './query/preparedQuery';
import {
  createUseLazyQuery,
  LazyFetchPolicy,
  UseLazyQuery,
} from './query/useLazyQuery';
import {
  createUsePaginatedQuery,
  PaginatedQueryFetchPolicy,
  UsePaginatedQuery,
} from './query/usePaginatedQuery';
import { createUseQuery, UseQuery } from './query/useQuery';
import { createUseRefetch, UseRefetch } from './query/useRefetch';
import {
  createUseTransactionQuery,
  UseTransactionQuery,
} from './query/useTransactionQuery';
import {
  createSSRHelpers,
  PrepareReactRender,
  UseHydrateCache,
} from './ssr/ssr';
import {
  createUseSubscription,
  UseSubscription,
} from './subscription/useSubscription';
import type { ReactClientOptionsWithDefaults } from './utils';

export interface ReactClientDefaults {
  /**
   * Enable/Disable by default 'React Suspense' behavior
   *
   * > _Valid for __graphql HOC__ & __useQuery___
   *
   * > _You can override it on a per-function basis_
   *
   * @default false
   */
  suspense?: boolean;
  /**
   * Enable/Disable by default 'React Suspense' behavior for useLazyQuery hook
   *
   * > _Valid only for __useLazyQuery___
   *
   * > _You can override it on a per-hook basis_
   *
   * @default false
   */
  lazyQuerySuspense?: boolean;
  /**
   * Enable/Disable by default 'React Suspense' behavior for useTransactionQuery hook
   *
   * > _Valid only for __useTransactionQuery___
   *
   * > _You can override it on a per-hook basis_
   *
   * __The _default value_ is obtained from the "`defaults.suspense`" value__
   */
  transactionQuerySuspense?: boolean;
  /**
   * Enable/Disable by default 'React Suspense' behavior for useMutation hook
   *
   * > _Valid only for __useMutation___
   *
   * > _You can override it on a per-hook basis_
   *
   * @default false
   */
  mutationSuspense?: boolean;
  /**
   * Enable/Disable by default 'React Suspense' behavior for prepareQuery hooks
   *
   * > _Valid only for __prepareQuery___ hooks
   *
   * > _You can override it on a per-hook basis_
   *
   * __The _default value_ is obtained from the "`defaults.suspense`" value__
   */
  preparedSuspense?: boolean;
  /**
   * Enable/Disable by default 'React Suspense' behavior for usePaginatedQuery hooks
   *
   * > _Valid only for __usePaginatedQuery___ hooks
   *
   * > _You can override it on a per-hook basis_
   *
   * @default false
   */
  paginatedQuerySuspense?: boolean;
  /**
   * Define default 'fetchPolicy' hooks behaviour
   *
   * > _Valid for __useTransactionQuery___
   *
   * > _You can override it on a per-hook basis_
   *
   * @default "cache-first"
   */
  transactionFetchPolicy?: LegacyFetchPolicy;
  /**
   * Define default 'fetchPolicy' hooks behaviour
   *
   * > Valid for __useLazyQuery__
   *
   * > _You can override it on a per-hook basis_
   *
   * @default "network-only"
   */
  lazyFetchPolicy?: LazyFetchPolicy;
  /**
   * Define default 'fetchPolicy' hooks behaviour
   *
   * > __Valid for __usePaginatedQuery____
   *
   * > _You can override it on a per-hook basis_
   *
   * @default "cache-first"
   */
  paginatedQueryFetchPolicy?: PaginatedQueryFetchPolicy;
  /**
   * __Enable__/__Disable__ default 'stale-while-revalidate' behaviour
   *
   * > _Valid for __graphql HOC__ & __useQuery___
   *
   * > _You can override it on a per-function basis_
   *
   * @default false
   */
  staleWhileRevalidate?: boolean;
  /**
   * Retry on error behaviour
   *
   * _You can override these defaults on a per-hook basis_
   *
   * > _Valid for __useLazyQuery__, __useTransactionQuery__ & __useRefetch___
   *
   * > For __useQuery__ & __graphql HOC__ you should use the `retry` in the core client options
   *
   * @default true
   */
  retry?: RetryOptions;
  /**
   * Refetch after SSR hydration
   *
   * @default false
   */
  refetchAfterHydrate?: boolean;
}

export interface CreateReactClientOptions {
  /**
   * Default behaviour values
   */
  defaults?: ReactClientDefaults;
}

export interface ReactClient<TSchema extends BaseGeneratedSchema> {
  useQuery: UseQuery<TSchema>;
  useRefetch: UseRefetch<TSchema>;
  useLazyQuery: UseLazyQuery<TSchema>;
  useTransactionQuery: UseTransactionQuery<TSchema>;
  usePaginatedQuery: UsePaginatedQuery<TSchema>;
  useMutation: UseMutation<TSchema>;
  graphql: GraphQLHOC;
  state: { isLoading: boolean };
  prepareReactRender: PrepareReactRender;
  useHydrateCache: UseHydrateCache;
  useMetaState: UseMetaState;
  useSubscription: UseSubscription<TSchema>;
  prepareQuery: PrepareQuery<TSchema>;
}

export function createReactClient<TSchema extends BaseGeneratedSchema>(
  client: GQtyClient<TSchema>,
  optsCreate: CreateReactClientOptions = {}
): ReactClient<TSchema> {
  const { suspense = false } = (optsCreate.defaults ||= {});

  const {
    transactionFetchPolicy = 'cache-first',
    lazyFetchPolicy = 'network-only',
    staleWhileRevalidate = false,
    retry = true,
    lazyQuerySuspense = false,
    transactionQuerySuspense = suspense,
    mutationSuspense = false,
    preparedSuspense = suspense,
    refetchAfterHydrate = false,
    paginatedQueryFetchPolicy = 'cache-first',
    paginatedQuerySuspense = suspense,
  } = optsCreate.defaults;

  const defaults: ReactClientOptionsWithDefaults['defaults'] = {
    transactionFetchPolicy,
    lazyFetchPolicy,
    staleWhileRevalidate,
    suspense,
    retry,
    lazyQuerySuspense,
    transactionQuerySuspense,
    mutationSuspense,
    preparedSuspense,
    refetchAfterHydrate,
    paginatedQueryFetchPolicy,
    paginatedQuerySuspense,
  };

  const opts: ReactClientOptionsWithDefaults = {
    ...optsCreate,
    defaults,
  };

  const { prepareReactRender, useHydrateCache } = createSSRHelpers(
    client,
    opts
  );

  return {
    useQuery: createUseQuery<TSchema>(client, opts),
    useRefetch: createUseRefetch(client, opts),
    useLazyQuery: createUseLazyQuery<TSchema>(client, opts),
    useTransactionQuery: createUseTransactionQuery<TSchema>(client, opts),
    usePaginatedQuery: createUsePaginatedQuery<TSchema>(client, opts),
    useMutation: createUseMutation<TSchema>(client, opts),
    graphql: createGraphqlHOC(client, opts),
    state: {
      get isLoading() {
        const cache = $meta(client.schema.query)?.context.cache;
        const promises = cache && getActivePromises(cache);

        return (promises?.length ?? 0) > 0;
      },
    },
    prepareReactRender,
    useHydrateCache,
    useMetaState: createUseMetaState(),
    useSubscription: createUseSubscription<TSchema>(client),
    prepareQuery: createPrepareQuery<TSchema>(client, opts),
  };
}
