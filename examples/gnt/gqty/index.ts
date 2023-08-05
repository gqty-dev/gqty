/**
 * GQty: You can safely modify this file based on your needs.
 */

import { Cache, GQtyError, createClient, type QueryFetcher } from 'gqty';
import {
  generatedSchema,
  scalarsEnumsHash,
  type GeneratedSchema,
} from './schema.generated';

const queryFetcher: QueryFetcher = async function (
  { query, variables, operationName, extensions },
  fetchOptions
) {
  console.debug({ query, variables, operationName, ...extensions });

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
      `GraphQL endpoint responded with HTTP ${response.status}: ${response.statusText}.`
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

const cache = new Cache(
  undefined,
  /**
   * Default option is immediate cache expiry but keep it for 5 minutes,
   * allowing soft refetches in background.
   */
  {
    maxAge: 0,
    staleWhileRevalidate: 5 * 60 * 1000,
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
