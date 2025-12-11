import {
  $meta,
  type BaseGeneratedSchema,
  type GQtyClient,
  type RetryOptions,
} from 'gqty';
import { getActivePromises } from 'gqty/Cache/query';
import type { LegacyFetchPolicy } from './common';
import { createUseMetaState, type UseMetaState } from './meta/useMetaState';
import { createUseMutation, type UseMutation } from './mutation/useMutation';
import { createGraphqlHOC, type GraphQLHOC } from './query/hoc';
import { createPrepareQuery, type PrepareQuery } from './query/preparedQuery';
import {
  createUseLazyQuery,
  type LazyFetchPolicy,
  type UseLazyQuery,
} from './query/useLazyQuery';
import {
  createUsePaginatedQuery,
  type PaginatedQueryFetchPolicy,
  type UsePaginatedQuery,
} from './query/usePaginatedQuery';
import { createUseQuery, type UseQuery } from './query/useQuery';
import { createUseRefetch, type UseRefetch } from './query/useRefetch';
import {
  createUseTransactionQuery,
  type UseTransactionQuery,
} from './query/useTransactionQuery';
import {
  createSSRHelpers,
  type PrepareReactRender,
  type UseHydrateCache,
} from './ssr/ssr.native';
import {
  createUseSubscription,
  type UseSubscription,
} from './subscription/useSubscription';
import type { ReactClientOptionsWithDefaults } from './utils';

export interface ReactClientDefaults {
  initialLoadingState?: boolean;
  suspense?: boolean;
  lazyQuerySuspense?: boolean;
  transactionQuerySuspense?: boolean;
  mutationSuspense?: boolean;
  preparedSuspense?: boolean;
  paginatedQuerySuspense?: boolean;
  transactionFetchPolicy?: LegacyFetchPolicy;
  lazyFetchPolicy?: LazyFetchPolicy;
  paginatedQueryFetchPolicy?: PaginatedQueryFetchPolicy;
  staleWhileRevalidate?: boolean;
  retry?: RetryOptions;
  refetchAfterHydrate?: boolean;
}

export interface CreateReactClientOptions {
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
  {
    defaults: { suspense = false } = {},
    defaults: {
      initialLoadingState = false,
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
    } = {},
    ...options
  }: CreateReactClientOptions = {}
): ReactClient<TSchema> {
  const opts: ReactClientOptionsWithDefaults = {
    ...options,
    defaults: {
      initialLoadingState,
      lazyFetchPolicy,
      lazyQuerySuspense,
      mutationSuspense,
      paginatedQueryFetchPolicy,
      paginatedQuerySuspense,
      preparedSuspense,
      refetchAfterHydrate,
      retry,
      staleWhileRevalidate,
      suspense,
      transactionFetchPolicy,
      transactionQuerySuspense,
    },
  };

  const { prepareReactRender, useHydrateCache } = createSSRHelpers(
    client,
    opts
  );

  const useQuery = createUseQuery<TSchema>(client, opts);

  return {
    useQuery,
    useRefetch: createUseRefetch(client, opts),
    useLazyQuery: createUseLazyQuery<TSchema>(client, opts),
    useTransactionQuery: createUseTransactionQuery<TSchema>(useQuery, opts),
    usePaginatedQuery: createUsePaginatedQuery<TSchema>(client, opts),
    useMutation: createUseMutation<TSchema>(client, opts),
    graphql: createGraphqlHOC(client, opts),
    state: {
      get isLoading() {
        const cache = $meta(client.schema.query)?.context.cache;
        const promises = cache && getActivePromises(cache);

        return !!promises?.length;
      },
    },
    prepareReactRender,
    useHydrateCache,
    useMetaState: createUseMetaState(),
    useSubscription: createUseSubscription<TSchema>(client),
    prepareQuery: createPrepareQuery<TSchema>(client, opts),
  };
}
