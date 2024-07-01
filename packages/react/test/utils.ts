import '@testing-library/jest-dom/extend-expect';
import {
  Cache,
  SchemaUnionsKey,
  createClient,
  type ClientOptions,
  type QueryFetcher,
  type Schema,
} from 'gqty';
import { createClient as createSubscriptionsClient } from 'graphql-ws';
import { merge } from 'lodash-es';
import { createTestApp, gql } from 'test-utils';
import type { PartialDeep } from 'type-fest';
import { generate } from '../../cli/src/generate';
import { createReactClient } from '../src';

export type Maybe<T> = T | null;
export type Human = {
  __typename: 'Human';
  id?: string;
  name: string;
  father: Human;
  nullFather?: Maybe<Human>;
  sons: Human[];
  dogs: Dog[];
};
export type Dog = {
  __typename: 'Dog';
  id?: string;
  name: string;
  owner?: Human;
};
export type Species =
  | {
      __typename: 'Human';
      id?: string;
      name: string;
      father: Human;
      nullFather?: Maybe<Human>;
      sons: Human[];
      dogs: Dog[];
      owner?: undefined;
    }
  | {
      __typename: 'Dog';
      id?: string;
      name: string;
      owner?: Human;
      father?: undefined;
      nullFather?: undefined;
      sons?: undefined;
      dogs?: undefined;
    };

export interface TestClientConfig {
  artificialDelay?: number;
  subscriptions?: boolean;
}

export const createReactTestClient = async (
  addedToGeneratedSchema?: PartialDeep<Schema>,
  queryFetcher?: QueryFetcher,
  config?: TestClientConfig,
  clientConfig: Partial<ClientOptions> = {}
) => {
  let dogId = 0;
  const dogs: { name: string; id: number }[] = [
    {
      id: ++dogId,
      name: 'a',
    },
    {
      id: ++dogId,
      name: 'b',
    },
  ];
  let humanId = 0;
  const humanIds: Record<string, number> = {};
  const createHuman = (name = 'default') => {
    return {
      id: (humanIds[name] ??= ++humanId),
      name,
      dogs,
      father: {},
    };
  };
  let nFetchCalls = 0;
  let throwTry = 0;
  const client = await createTestApp({
    schema: {
      typeDefs: gql`
        type Query {
          hello: String!
          stringArg(arg: String!): String!
          human(name: String): Human
          nFetchCalls: Int!
          throw: Boolean
          throw2: Boolean
          nullArray: [Human]
          nullStringArray: [String]
          time: String!
          species: [Species!]!
          throwUntilThirdTry: Boolean!
          dogs: [Dog!]!
        }
        type Mutation {
          sendNotification(message: String!): Boolean!
          humanMutation(nameArg: String!): Human
          renameHuman(name: String!, newName: String!): Human
        }
        type Subscription {
          newNotification: String!
        }
        type Human {
          id: ID
          name: String!
          father: Human!
          nullFather: Human
          sons: [Human!]!
          dogs: [Dog!]!
        }
        type Dog {
          id: ID
          name: String!
          owner: Human
        }
        union Species = Human | Dog
      `,
      resolvers: {
        Query: {
          throwUntilThirdTry() {
            throwTry++;
            if (throwTry < 3) {
              throw Error('try again, throwTry=' + throwTry);
            }
            throwTry = 0;
            return true;
          },
          stringArg(_root, { arg }: { arg: string }) {
            return arg;
          },
          hello() {
            return 'hello world';
          },
          human(_root, { name }: { name?: string }) {
            return createHuman(name);
          },
          nFetchCalls() {
            return nFetchCalls;
          },
          nullArray() {
            return null;
          },
          nullStringArray() {
            return null;
          },
          async throw() {
            throw new Error('expected error');
          },
          async throw2() {
            throw new Error('expected error 2');
          },
          time() {
            return new Date().toISOString();
          },
          species() {
            return [createHuman(), ...dogs];
          },
          dogs() {
            return dogs;
          },
        },
        Dog: {
          owner({ name }: { name: string }) {
            return createHuman(name + '-owner');
          },
        },
        Mutation: {
          sendNotification(_root, { message }: { message: string }, ctx) {
            ctx.pubsub.publish('NOTIFICATION', {
              newNotification: message,
            });

            return true;
          },
          humanMutation(_root, { nameArg }: { nameArg: string }) {
            return createHuman(nameArg);
          },
          renameHuman(
            _root,
            { name, newName }: { name: string; newName: string }
          ) {
            if (!humanIds[name]) {
              throw new Error(`Human ${name} not found`);
            }

            humanIds[newName] = humanIds[name];
            delete humanIds[name];

            return createHuman(newName);
          },
        },
        Subscription: {
          newNotification: {
            subscribe(_root, _args, ctx) {
              return ctx.pubsub.subscribe('NOTIFICATION');
            },
          },
        },
        Human: {
          father() {
            return createHuman();
          },
          sons() {
            return [createHuman(), createHuman()];
          },
          dogs() {
            return dogs;
          },
        },
        Species: {
          __resolveType(v: Species) {
            if ('father' in v) return 'Human';
            return 'Dog';
          },
        },
      },
    },
    async buildContext() {
      nFetchCalls++;

      if (config?.artificialDelay) {
        await new Promise((resolve) =>
          setTimeout(resolve, config.artificialDelay)
        );
      }
      return {};
    },
  });

  const { generatedSchema, scalarsEnumsHash } = await generate(
    client.getEnveloped().schema
  );

  const [existingUnionKey] = Object.getOwnPropertySymbols(generatedSchema);

  if (existingUnionKey)
    Reflect.set(
      generatedSchema,
      SchemaUnionsKey,
      Reflect.get(generatedSchema, existingUnionKey)
    );

  if (queryFetcher == null) {
    queryFetcher = ({ query, variables, operationName }) => {
      return client.query(query, {
        variables,
        operationName,
      });
    };
  }

  const subscriptionsClient = config?.subscriptions
    ? createSubscriptionsClient({
        url: client.endpoint.replace('http:', 'ws:'),
        retryAttempts: 0,
      })
    : undefined;

  type GeneratedSchema = {
    query: {
      hello: string;
      stringArg: (args: { arg: string }) => string;
      human: (args?: { name?: string }) => Human;
      nullArray?: Maybe<Array<Maybe<Human>>>;
      nullStringArray?: Maybe<Array<Maybe<string>>>;
      nFetchCalls: number;
      throw?: boolean;
      throw2?: boolean;
      time: string;
      species: Array<Species>;
      throwUntilThirdTry: boolean;
      dogs: Array<Dog>;
    };
    mutation: {
      sendNotification(args: { message: string }): boolean;
      humanMutation: (args?: { nameArg?: string }) => Human;
      renameHuman: (args: { name: string; newName: string }) => Human;
    };
    subscription: {
      newNotification: string | null | undefined;
    };
  };

  const core = Object.assign(
    createClient<GeneratedSchema>({
      cache: new Cache(undefined, {
        maxAge: 0,
        staleWhileRevalidate: 5 * 60 * 1000,
        normalization: true,
      }),
      schema: merge(generatedSchema, [addedToGeneratedSchema]) as Schema,
      scalars: scalarsEnumsHash,
      fetchOptions: {
        fetcher: queryFetcher,
        subscriber: subscriptionsClient,
      },
      ...clientConfig,
    }),
    { client }
  );

  const react = createReactClient<GeneratedSchema>(core, {
    defaults: {},
  });

  return {
    ...core,
    ...react,
  };
};

export const sleep = (amount: number) =>
  new Promise((resolve) => setTimeout(resolve, amount));
