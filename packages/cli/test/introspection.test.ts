import { GraphQLObjectType, GraphQLSchema } from 'graphql';
import { assertIsDefined, createTestApp, gql } from 'test-utils';
import { getRemoteSchema } from '../src';
import './utils';

const testAppPromise = createTestApp({
  schema: {
    typeDefs: gql`
      type Query {
        hello: String!
      }
    `,
    resolvers: {
      Query: {
        hello() {
          return 'hello world';
        },
      },
    },
  },
});

let endpoint: string;
beforeAll(async () => {
  const testApp = await testAppPromise;

  endpoint = testApp.endpoint;
});

test('introspection works', async () => {
  const schema = await getRemoteSchema(endpoint);

  expect(schema).toBeInstanceOf(GraphQLSchema);

  const queryType = schema.getQueryType();

  expect(queryType).toBeInstanceOf(GraphQLObjectType);

  assertIsDefined(queryType);

  const fieldsMap = queryType.getFields();

  const hello = fieldsMap['hello'];

  assertIsDefined(hello);
});
