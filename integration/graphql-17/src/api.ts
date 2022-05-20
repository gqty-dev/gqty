import { CreateApp, LazyPromise } from '@graphql-ez/fastify';
import { CreateTestClient } from '@graphql-ez/fastify-testing';
import {
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';

export const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      hello: {
        type: new GraphQLNonNull(GraphQLString),
        resolve() {
          return 'Hello World';
        },
      },
    },
  }),
});

export const API = CreateApp({
  schema,
});

export const TestClient = LazyPromise(() => CreateTestClient(API));
