import { createClient, QueryFetcher } from 'gqty';

import { ezApp } from '..';
import {
  GeneratedSchema,
  generatedSchema,
  scalarsEnumsHash,
} from './schema.generated';

import { CreateTestClient } from '@graphql-ez/fastify-testing';

const testClientPromise = CreateTestClient(ezApp);
const queryFetcher: QueryFetcher = async function ({
  query,
  variables,
  operationName,
}) {
  const testClient = await testClientPromise;

  return testClient.query(query, {
    variables,
    operationName,
  });
};

export const client = createClient<GeneratedSchema>({
  schema: generatedSchema,
  scalars: scalarsEnumsHash,
  cacheOptions: {
    normalization: {
      identity(obj) {
        switch (obj.__typename) {
          case 'A': {
            return `${obj.a ?? ''}`;
          }
          default: {
            return;
          }
        }
      },
      schemaKeys: {},
    },
  },
  fetchOptions: {
    fetcher: queryFetcher,
  },
});

const { query, mutation, mutate, subscription, resolved, refetch } = client;

export * from './schema.generated';
export { query, mutation, mutate, subscription, resolved, refetch };
