import { createClient, QueryFetcher } from 'gqty';

import { ezApp } from '..';
import {
  GeneratedSchema,
  generatedSchema,
  scalarsEnumsHash,
  SchemaObjectTypes,
  SchemaObjectTypesNames,
} from './schema.generated';

import { CreateTestClient } from '@graphql-ez/fastify-testing';

const testClientPromise = CreateTestClient(ezApp);
const queryFetcher: QueryFetcher = async function (query, variables) {
  const testClient = await testClientPromise;

  return testClient.query(query, {
    variables,
  });
};

export const client = createClient<
  GeneratedSchema,
  SchemaObjectTypesNames,
  SchemaObjectTypes
>({
  schema: generatedSchema,
  scalarsEnumsHash,
  queryFetcher,
  normalization: {
    identifier(obj) {
      switch (obj.__typename) {
        case 'A': {
          return obj.a;
        }
        default: {
          return;
        }
      }
    },
    keyFields: {},
  },
});

export const { query, mutation, mutate, subscription, resolved, refetch } =
  client;

export * from './schema.generated';
