/**
 * GQty: You can safely modify this file based on your needs.
 */

import { createLogger } from '@gqty/logger';
import {
  Cache,
  createClient,
  defaultResponseHandler,
  type QueryFetcher,
} from 'gqty';
import {
  type GeneratedSchema,
  generatedSchema,
  scalarsEnumsHash,
} from './schema.generated';

const queryFetcher: QueryFetcher = async function (
  { query, variables, operationName, extensions },
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

  return await defaultResponseHandler(response);
};

const cache = new Cache(
  undefined,
  /**
   * Cache is valid for 30 minutes, but starts revalidating after 5 seconds,
   * allowing soft refetches in background.
   */
  {
    maxAge: 5000,
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

export * from './schema.generated';
