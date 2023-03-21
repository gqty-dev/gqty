/**
 * GQty: You can safely modify this file based on your needs.
 */

import type { QueryFetcher } from 'gqty';
import { createClient } from 'gqty';
import { TestClient } from './api';
import type { GeneratedSchema } from './schema.generated';
import { generatedSchema, scalarsEnumsHash } from './schema.generated';

const queryFetcher: QueryFetcher = async function ({ query, variables }) {
  return (await TestClient).query(query, {
    variables,
  });
};

export const client = createClient<GeneratedSchema>({
  schema: generatedSchema,
  scalars: scalarsEnumsHash,
  fetchOptions: {
    fetcher: queryFetcher,
  },
});

const { query, mutation, mutate, subscription, resolved, refetch, track } =
  client;

export * from './schema.generated';
export { query, mutation, mutate, subscription, resolved, refetch, track };
