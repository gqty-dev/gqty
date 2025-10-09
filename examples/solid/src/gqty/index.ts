/**
 * GQty: You can safely modify this file based on your needs.
 */

import { createSolidClient } from '@gqty/solid';
import {
  Cache,
  createClient,
  defaultResponseHandler,
  GQtyError,
  type QueryFetcher,
} from 'gqty';
import {
  type GeneratedSchema,
  generatedSchema,
  scalarsEnumsHash,
} from './schema.generated';

const queryFetcher: QueryFetcher = async function (
  { query, variables, operationName },
  fetchOptions
) {
  // Modify "https://rickandmortyapi.com/graphql" if needed
  const response = await fetch('https://rickandmortyapi.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
      operationName,
    }),
    mode: 'cors',
    ...fetchOptions,
  });

  if (response.status >= 400) {
    throw new GQtyError(
      `GraphQL endpoint responded with HTTP status ${response.status}.`
    );
  }

  return await defaultResponseHandler(response);
};

const cache = new Cache(
  undefined,
  /**
   * Cache is valid for 30 minutes, but starts revalidating after 5 seconds,
   * allowing soft refetches in background.
   */
  {
    maxAge: 5 * 1000,
    staleWhileRevalidate: 30 * 60 * 1000,
    normalization: true,
  }
);

export const client = createClient<GeneratedSchema>({
  schema: generatedSchema,
  scalars: scalarsEnumsHash,
  cache,
  fetchOptions: {
    fetcher: queryFetcher,
  },
});

export const { createQuery } = createSolidClient(client);

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

export * from './schema.generated';
