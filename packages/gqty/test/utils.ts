import { createTestApp, gql, TestApp } from 'test-utils';

import { generate } from '../../cli/src/generate';
import { createSubscriptionsClient } from '../../subscriptions/src/index';
import {
  ClientOptions,
  createClient,
  DeepPartial,
  QueryFetcher,
  Schema,
  SchemaUnionsKey,
  SubscriptionsClient,
  GQtyClient,
} from '../src';
import { deepAssign } from '../src/Utils';

type ObjectTypesNames = 'Human' | 'Query' | 'Mutation' | 'Subscription';

type ObjectTypes = {
  Human: Human;
  Query: {
    __typename: 'Query';
  };
  Mutation: {
    __typename: 'Mutation';
  };
  Subscription: {
    __typename: 'Subscription';
  };
};

export type Maybe<T> = T | null;
export type Human = {
  __typename: 'Human';
  id?: string;
  name: string;
  father: Human;
  nullFather?: Maybe<Human>;
  sons: Human[];
  dogs: Dog[];

  node: Array<Node>;
  union: Array<{
    __typename: 'A' | 'B' | 'C';
    $on: {
      A?: A;
      B?: C;
      C?: C;
    };
  }>;
};
export type Dog = {
  __typename: 'Dog';
  id?: string;
  name: string;
  owner?: Human;
};
export type Species = {
  __typename?: 'Human' | 'Dog';
  $on: {
    Human?: Human;
    Dog?: Dog;
  };
};

const TeardownPromises: Promise<unknown>[] = [];

afterAll(async () => {
  await Promise.all(TeardownPromises);
});

export type Node = {
  __typename?: 'A' | 'B' | 'C';
  id?: string;
  node: Node;

  $on: {
    A?: A;
    B?: B;
    C?: C;
  };
};

export interface A {
  __typename?: 'A';
  id?: string;
  a?: number;
  node: Node;
}

export interface B {
  __typename?: 'B';
  id?: string;
  b?: number;
  node: Node;
}

export interface C {
  __typename?: 'C';
  id?: string;
  c?: number;
  node: Node;
}

export type GeneratedSchema = {
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
    node(args: { type: 'A' | 'B' | 'C' }): Node;
    union(args: { type: 'A' | 'B' | 'C' }): {
      __typename: 'A' | 'B' | 'C';
      $on: {
        A: A;
        B: B;
        C: C;
      };
    };
  };
  mutation: {
    sendNotification(args: { message: string }): boolean;
    humanMutation: (args?: { nameArg?: string }) => Human;
    createDog: (args?: { name?: string }) => Dog;
  };
  subscription: {
    newNotification: string | null | undefined;
    newHuman: Human;
    newDog: Dog;
  };
};

export interface TestClientConfig {
  artificialDelay?: number;
  subscriptions?: boolean;
}

export type TestClient = GQtyClient<GeneratedSchema> & {
  client: TestApp;
  queries: {
    query: string;
    variables?: Record<string, unknown> | undefined;
  }[];
};

export const createTestClient = async (
  addedToGeneratedSchema?: DeepPartial<Schema>,
  queryFetcher?: QueryFetcher,
  config?: TestClientConfig,
  clientConfig: Partial<ClientOptions<ObjectTypesNames, ObjectTypes>> = {}
): Promise<TestClient> => {
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
  const createHuman = (name: string = 'default') => {
    return {
      id: (humanIds[name] ??= ++humanId),
      name,
      dogs,
      father: {},
    };
  };
  let nFetchCalls = 0;
  let throwTry = 0;

  const queries: {
    query: string;
    variables?: Record<string, unknown>;
    result?: unknown;
  }[] = [];
  const client = await createTestApp(
    {
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
            createDog(name: String!): Dog!
          }
          type Subscription {
            newNotification: String!
            newHuman: Human!
            newDog: Dog!
          }
          type Human {
            id: ID
            name: String!
            father: Human!
            nullFather: Human
            sons: [Human!]!
            dogs: [Dog!]!
            node: [Node!]!
            union: [ABC!]!
          }
          type Dog {
            id: ID
            name: String!
            owner: Human
          }
          union Species = Human | Dog

          enum NodeType {
            A
            B
            C
          }
          extend type Query {
            node(type: NodeType!): Node!
            union(type: NodeType!): ABC!
          }

          interface Node {
            id: ID!

            node: Node!
          }

          type A implements Node {
            id: ID!

            a: Int!

            node: Node!
          }

          type B implements Node {
            id: ID!

            b: Int!

            node: Node!
          }

          type C implements Node {
            id: ID!

            c: Int!

            node: Node!
          }

          union ABC = A | B | C
        `,
        resolvers: {
          Node: {
            __resolveType(obj: { __typename: 'A' | 'B' | 'C' }) {
              return obj.__typename;
            },
            node() {
              return {
                __typename: 'A',
                a: 1,
                id: 1,
              };
            },
          },
          A: {
            node() {
              return {
                __typename: 'A',
                a: 1,
                id: 1,
              };
            },
          },
          B: {
            node() {
              return {
                __typename: 'A',
                a: 1,
                id: 1,
              };
            },
          },
          C: {
            node() {
              return {
                __typename: 'B',
                b: 2,
                id: 2,
              };
            },
          },
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
              throw Error('expected error');
            },
            async throw2() {
              throw Error('expected error 2');
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
            node(
              _root: never,
              { type: __typename }: { type: 'A' | 'B' | 'C' }
            ) {
              switch (__typename) {
                case 'A':
                  return {
                    __typename,
                    id: 1,
                    a: 1,
                  };
                case 'B':
                  return {
                    __typename,
                    id: 2,
                    b: 2,
                  };
                case 'C':
                  return {
                    __typename,
                    id: 3,
                    c: 3,
                  };
              }
            },
            union(
              _root: never,
              { type: __typename }: { type: 'A' | 'B' | 'C' }
            ) {
              switch (__typename) {
                case 'A':
                  return {
                    __typename,
                    id: 1,
                    a: 1,
                  };
                case 'B':
                  return {
                    __typename,
                    id: 2,
                    b: 2,
                  };
                case 'C':
                  return {
                    __typename,
                    id: 3,
                    c: 3,
                  };
              }
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
            humanMutation(_root, { nameArg }: { nameArg: string }, { pubsub }) {
              const human = createHuman(nameArg);

              pubsub.publish('NEW_HUMAN', {
                newHuman: human,
              });

              return human;
            },
            createDog(_root, { name }: { name: string }, { pubsub }) {
              const dog = {
                id: ++dogId,
                name,
              };

              pubsub.publish('NEW_DOG', {
                newDog: dog,
              });

              return dog;
            },
          },
          Subscription: {
            newNotification: {
              subscribe(_root, _args, ctx) {
                return ctx.pubsub.subscribe('NOTIFICATION');
              },
            },

            newHuman: {
              subscribe(_root, _args, ctx) {
                return ctx.pubsub.subscribe('NEW_HUMAN');
              },
            },
            newDog: {
              subscribe(_root, _args, ctx) {
                return ctx.pubsub.subscribe('NEW_DOG');
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
            node() {
              return [
                {
                  __typename: 'A',
                  a: 1,
                  id: 1,
                },
                {
                  __typename: 'B',
                  b: 2,
                  id: 2,
                },
                {
                  __typename: 'C',
                  c: 3,
                  id: 3,
                },
              ];
            },
            union() {
              return [
                {
                  __typename: 'A',
                  a: 1,
                  id: 1,
                },
                {
                  __typename: 'B',
                  b: 2,
                  id: 2,
                },
                {
                  __typename: 'C',
                  c: 3,
                  id: 3,
                },
              ];
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
    },
    {
      websockets: config?.subscriptions,
    }
  );

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
    queryFetcher = async (query, variables) => {
      const index =
        queries.push({
          query,
          variables,
        }) - 1;
      return client
        .query<Record<string, any>>(query, {
          variables,
        })
        .then((result) => {
          queries[index].result = result;
          return result;
        });
    };
  }

  let subscriptionsClient: SubscriptionsClient | undefined;

  subscriptionsClient = config?.subscriptions
    ? createSubscriptionsClient({
        wsEndpoint: client.endpoint.replace('http:', 'ws:'),
        reconnect: false,
      })
    : undefined;

  subscriptionsClient &&
    TeardownPromises.push(
      LazyPromise(() => {
        subscriptionsClient!.close();
      })
    );

  const testClient = Object.assign(
    createClient<GeneratedSchema, ObjectTypesNames, ObjectTypes>({
      schema: deepAssign(generatedSchema, [addedToGeneratedSchema]) as Schema,
      scalarsEnumsHash,
      queryFetcher,
      subscriptionsClient,
      ...clientConfig,
    }),
    {
      client,
      queries,
    }
  );

  return testClient;
};

export const sleep = (amount: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, amount));

const consoleWarn = console.warn;
export function expectConsoleWarn(
  cb: (n: number, ...message: unknown[]) => void
) {
  const spy = jest.spyOn(console, 'warn');

  let n = 0;
  spy.mockImplementation((...message) => {
    cb(++n, ...message);
  });

  return { spy, consoleWarn };
}

export class PLazy<ValueType> extends Promise<ValueType> {
  private _promise?: Promise<ValueType>;

  constructor(
    private _executor: (
      resolve: (value: ValueType) => void,
      reject: (err: unknown) => void
    ) => void
  ) {
    super((resolve: (v?: any) => void) => resolve());
  }

  then: Promise<ValueType>['then'] = (onFulfilled, onRejected) =>
    (this._promise ||= new Promise(this._executor)).then(
      onFulfilled,
      onRejected
    );

  catch: Promise<ValueType>['catch'] = (onRejected) =>
    (this._promise ||= new Promise(this._executor)).catch(onRejected);

  finally: Promise<ValueType>['finally'] = (onFinally) =>
    (this._promise ||= new Promise(this._executor)).finally(onFinally);
}

export function LazyPromise<Value>(
  fn: () => Value | Promise<Value>
): Promise<Value> {
  return new PLazy((resolve, reject) => {
    try {
      Promise.resolve(fn()).then(resolve, (err) => {
        if (err instanceof Error) Error.captureStackTrace(err, LazyPromise);

        reject(err);
      });
    } catch (err) {
      if (err instanceof Error) Error.captureStackTrace(err, LazyPromise);

      reject(err);
    }
  });
}
