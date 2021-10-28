/**
 * GQTY: You can safely modify this file and Query Fetcher based on your needs
 */

import { createVueClient } from '@gqty/vue';

import type { QueryFetcher } from 'gqty';
import { createClient } from 'gqty';
import type {
  GeneratedSchema,
  SchemaObjectTypes,
  SchemaObjectTypesNames,
} from './schema.generated';
import { generatedSchema, scalarsEnumsHash } from './schema.generated';

const queryFetcher: QueryFetcher = async function (query, variables) {
  // Modify "http://127.0.0.1:4141/api/graphql" if needed
  const response = await fetch('http://127.0.0.1:4141/api/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
    mode: 'cors',
  });

  const json = await response.json();

  return json;
};

export const client = createClient<
  GeneratedSchema,
  SchemaObjectTypesNames,
  SchemaObjectTypes
>({
  schema: generatedSchema,
  scalarsEnumsHash,
  queryFetcher,
});

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
  // graphql,
  useQuery,
  // usePaginatedQuery,
  // useTransactionQuery,
  // useLazyQuery,
  // useRefetch,
  useMutation,
  useMetaState,
  // prepareVueRender,
  // useHydrateCache,
  // prepareQuery,
} = createVueClient<GeneratedSchema>(client, {
  defaults: {
    // Set this flag as "true" if your usage involves Vue Suspense
    // Keep in mind that you can overwrite it in a per-hook basis
    // suspense: false,

    // Set this flag based on your needs
    staleWhileRevalidate: false,
  },
});

export * from './schema.generated';
