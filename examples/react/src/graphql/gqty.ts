/**
 * GQTY: You can safely modify this file and Query Fetcher based on your needs
 */

import { createClient, QueryFetcher } from 'gqty';
import { createClient as createSubscriptionsClient } from 'graphql-ws';
import {
  generatedSchema,
  GeneratedSchema,
  scalarsEnumsHash,
} from './schema.generated';

const queryFetcher: QueryFetcher = async function ({
  query,
  variables,
  operationName,
}) {
  const response = await fetch(
    typeof window === 'undefined'
      ? 'http://localhost:4141/api/graphql'
      : '/api/graphql',
    {
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
    }
  );

  const json = await response.json();

  return json;
};

const subscriptionsClient =
  typeof window !== 'undefined'
    ? createSubscriptionsClient({
        lazy: true,
        url: () => {
          // Modify if needed
          const url = new URL('/api/graphql', window.location.href);
          url.protocol = url.protocol.replace('http', 'ws');

          console.log(42, url.href);
          return url.href;
        },
      })
    : undefined;

export const client = createClient<GeneratedSchema>({
  schema: generatedSchema,
  scalars: scalarsEnumsHash,
  fetchOptions: {
    fetcher: queryFetcher,
    subscriber: subscriptionsClient,
  },
});

const { query, mutation, mutate, subscription, resolved, refetch, track } =
  client;

export * from './schema.generated';
export { query, mutation, mutate, subscription, resolved, refetch, track };
