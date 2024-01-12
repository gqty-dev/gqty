import { createLogger } from '@gqty/logger';
import { createReactClient } from '@gqty/react';
import { cache, client, GeneratedSchema } from '../graphql/gqty';

export const {
  graphql,
  prepareQuery,
  prepareReactRender,
  state,
  useHydrateCache,
  useLazyQuery,
  useMetaState,
  useMutation,
  usePaginatedQuery,
  useQuery,
  useRefetch,
  useSubscription,
  useTransactionQuery,
} = createReactClient<GeneratedSchema>(client, {
  defaults: {
    suspense: true,
    staleWhileRevalidate: false,
    transactionQuerySuspense: false,
  },
});

if (typeof window !== 'undefined') {
  const logger = createLogger(client, {});
  logger.start();
}

// Core functions
const { resolve, subscribe, schema } = client;

// Legacy functions
const { query, mutation, mutate, subscription, resolved, refetch, track } =
  client;

export {
  cache,
  resolve,
  subscribe,
  schema,
  query,
  mutation,
  mutate,
  subscription,
  resolved,
  refetch,
  track,
};
