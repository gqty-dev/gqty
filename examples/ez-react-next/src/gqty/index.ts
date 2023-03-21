/**
 * GQty: You can safely modify this file based on your needs.
 */

import { createLogger } from '@gqty/logger';
import { createReactClient } from '@gqty/react';
import { createClient, QueryFetcher } from 'gqty';
import {
  generatedSchema,
  GeneratedSchema,
  scalarsEnumsHash,
} from './schema.generated';

const endpoint =
  typeof window !== 'undefined'
    ? '/api/graphql'
    : 'http://localhost:3000/api/graphql';

const queryFetcher: QueryFetcher = async function (
  { query, variables, operationName },
  fetchOptions
) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
      operationName,
    }),
    ...fetchOptions,
  });

  const json = await response.json();

  return json;
};

export const client = createClient<GeneratedSchema>({
  schema: generatedSchema,
  scalars: scalarsEnumsHash,
  fetchOptions: {
    fetcher: queryFetcher,
  },
});

if (typeof window !== 'undefined') {
  const logger = createLogger(client);

  logger.start();
}

const { query, mutation, mutate, subscription, resolved, refetch, track } =
  client;

export * from './schema.generated';
export { query, mutation, mutate, subscription, resolved, refetch, track };
export {
  graphql,
  useQuery,
  usePaginatedQuery,
  useTransactionQuery,
  useLazyQuery,
  useRefetch,
  useMutation,
  useMetaState,
  prepareReactRender,
  useHydrateCache,
  prepareQuery,
};

const {
  graphql,
  useQuery,
  usePaginatedQuery,
  useTransactionQuery,
  useLazyQuery,
  useRefetch,
  useMutation,
  useMetaState,
  prepareReactRender,
  useHydrateCache,
  prepareQuery,
} = createReactClient<GeneratedSchema>(client, {
  defaults: {
    // Set this flag as "true" if your usage involves React Suspense
    // Keep in mind that you can overwrite it in a per-hook basis
    suspense: false,

    // Set this flag based on your needs
    staleWhileRevalidate: false,
  },
});
