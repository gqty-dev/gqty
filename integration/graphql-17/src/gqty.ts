/**
 * GQty: You can safely modify this file based on your needs.
 */

import { Cache, createClient, QueryFetcher } from 'gqty';
import { TestClient } from './api';
import type { GeneratedSchema } from './schema.generated';
import { generatedSchema, scalarsEnumsHash } from './schema.generated';

const queryFetcher: QueryFetcher = async function (query, variables) {
  return (await TestClient).query(query, {
    variables,
  });
};

export const client = createClient<GeneratedSchema>({
  cache: new Cache(),
  schema: generatedSchema,
  scalars: scalarsEnumsHash,
  queryFetcher,
});

const { query, mutation, mutate, subscription, resolved, refetch, track } =
  client;

export * from './schema.generated';
export { query, mutation, mutate, subscription, resolved, refetch, track };
