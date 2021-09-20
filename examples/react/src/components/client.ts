import { createLogger } from '@gqty/logger';

import { createReactClient } from '@gqty/react';
import { client, GeneratedSchema } from '../graphql/gqty';

export const {
  useTransactionQuery,
  useQuery,
  state,
  graphql,
  useRefetch,
  useLazyQuery,
  prepareReactRender,
  useHydrateCache,
  useMutation,
  useMetaState,
  useSubscription,
  prepareQuery,
  usePaginatedQuery,
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

export const { refetch } = client;
