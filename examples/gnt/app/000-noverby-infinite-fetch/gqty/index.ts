/**
 * GQty: You can safely modify this file based on your needs.
 */

import { createLogger } from '@gqty/logger';
import { createReactClient } from '@gqty/react';
import { Cache, GQtyError, createClient, type QueryFetcher } from 'gqty';
import {
  generatedSchema,
  scalarsEnumsHash,
  type GeneratedSchema,
} from './schema.generated';

const queryFetcher: QueryFetcher = async function (
  { query, variables, operationName },
  fetchOptions
) {
  // Modify "https://pgvhpsenoifywhuxnybq.nhost.run/v1/graphql" if needed
  const response = await fetch(
    'https://pgvhpsenoifywhuxnybq.nhost.run/v1/graphql',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-role': 'public',
      },
      body: JSON.stringify({
        query,
        variables,
        operationName,
      }),
      mode: 'cors',
      ...fetchOptions,
    }
  );

  if (response.status >= 400) {
    throw new GQtyError(
      `GraphQL endpoint responded with HTTP status ${response.status}.`
    );
  }

  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    throw new GQtyError(
      `Malformed JSON response: ${
        text.length > 50 ? text.slice(0, 50) + '...' : text
      }`
    );
  }
};

const cache = new Cache(undefined, {
  maxAge: Infinity,
  staleWhileRevalidate: 5 * 60 * 1000,
  normalization: true,
});

export const client = createClient<GeneratedSchema>({
  schema: generatedSchema,
  scalars: scalarsEnumsHash,
  cache,
  fetchOptions: {
    fetcher: queryFetcher,
  },
});

createLogger(client).start();

// Core functions
export const { resolve, subscribe, schema } = client;

// Legacy functions
export const {
  query,
  mutation,
  mutate,
  subscription,
  resolved,
  refetch,
  track,
} = client;

export const {
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
  useSubscription,
} = createReactClient<GeneratedSchema>(client, {
  defaults: {
    // Enable Suspense, you can override this option at hooks.
    suspense: true,
  },
});

export * from './schema.generated';
