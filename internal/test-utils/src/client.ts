import { buildHTTPExecutor } from '@graphql-tools/executor-http';
import assert from 'assert';
import {
  Cache,
  createClient,
  type BaseGeneratedSchema,
  type GQtyClient,
  type QueryPayload,
} from 'gqty';
import { parse, type ExecutionResult } from 'graphql';
import { DateTimeISOResolver } from 'graphql-scalars';
import type { Client, Sink, SubscribePayload } from 'graphql-ws';
import { createPubSub, createSchema, createYoga } from 'graphql-yoga';
import type { GeneratedSchema } from './schema.generated';

export type MockClientOptions = Omit<TestClientOptions, 'schema'> & {
  mockData?: {
    peoples?: Record<string, People>;
    cats?: Record<string, Pet>;
    dogs?: Record<string, Pet>;
  };
};

type People = { id: string; name: string; pets: Pet[] };
type Pet = { id: string; name?: string; owner?: People };

export const createMockClient = async (options?: MockClientOptions) => {
  const peoples = options?.mockData?.peoples ?? {};
  const cats = options?.mockData?.cats ?? {};
  const dogs = options?.mockData?.dogs ?? {};

  const pubsub = createPubSub<{
    people: [
      {
        type: 'CREATED' | 'UPDATED' | 'DELETED';
        people: People;
      },
    ];
  }>();

  return createInMemoryClient<GeneratedSchema>({
    ...options,
    schema: {
      resolvers: {
        Date: DateTimeISOResolver,
        Query: {
          now: () => new Date(),
          peoples: () => Object.values(peoples),
          people: (_, { id }) => peoples[id],
          pet: (_, { id }) => {
            const cat = cats[id];
            if (cat) {
              return {
                __typename: 'Cat',
                ...cat,
              };
            }

            const dog = dogs[id];
            if (dog) {
              return {
                __typename: 'Dog',
                ...dog,
              };
            }

            return null;
          },
        },
        People: {
          pets: (people) => Array.from(people.pets),
        },
        Cat: {
          pet: () => null,
        },
        Dog: {
          pet: ({ name }, { times }) =>
            `${name ?? `Stray dog`}: ${'arf!'.repeat(times)} `,
        },
        Mutation: {
          takePet: (_, { people, pet }) => {
            const peopleObj = peoples[people];
            assert(peopleObj, `People ${people} not found`);

            const petObj = cats[pet] ?? dogs[pet];
            assert(petObj, `Pet ${pet} not found`);

            peopleObj.pets.push(petObj);

            pubsub.publish('people', {
              type: 'UPDATED',
              people: peopleObj,
            });

            return petObj;
          },
          dropPet: (_, { people, pet }) => {
            const peopleObj = peoples[people];
            assert(peopleObj, `People ${people} not found`);

            const petObj = cats[pet] ?? dogs[pet];
            assert(petObj, `Pet ${pet} not found`);

            const petIdx = peopleObj.pets.findIndex((p) => p === petObj);
            assert(petIdx !== -1, `Pet ${pet} not found in ${people}`);
            peopleObj.pets.splice(petIdx, 1);

            pubsub.publish('people', {
              type: 'UPDATED',
              people: peopleObj,
            });

            return petObj;
          },
          createPeople: (_, { name }) => {
            const peopleId = Object.keys(peoples).length.toString();
            const people = { id: peopleId, name, pets: [] };

            peoples[peopleId] = people;

            pubsub.publish('people', {
              type: 'CREATED',
              people,
            });

            return people;
          },
          createDog: (_, { name }) => {
            const dogId = Object.keys(dogs).length.toString();
            const dog = { id: dogId, name };

            dogs[dogId] = dog;

            return dog;
          },
          renameDog: (_, { id, name }) => {
            const dog = dogs[id];
            assert(dog, `Dog ${id} not found`);

            dog.name = name;

            return dog;
          },
          createCat: (_, { name }) => {
            const catId = Object.keys(cats).length.toString();
            const cat = { id: catId, name };

            cats[catId] = cat;

            return cat;
          },
          renameCat: (_, { id, name }) => {
            const cat = cats[id];
            assert(cat, `Cat ${id} not found`);

            cat.name = name;

            return cat;
          },
        },
        Subscription: {
          peopleChanged: {
            subscribe: () => pubsub.subscribe('people'),
          },
        },
      },
      typeDefs: /* GraphQL */ `
        """
        # Basic query
        1. Top-level scalar
        2. Object types
        3. Unions
        4. Interfaces
        5. Arrays

        ## Special cases
        1. Nullables
        2. Empty arrays
        3. Recursive relationships
        4. Customer scalar
        """
        type Query {
          now: Date!
          peoples: [People!]!
          people(id: ID!): People
          pet(id: ID!): Pet
        }

        scalar Date

        type People {
          id: ID!
          name: String!
          pets: [Pet!]!
        }

        interface Pet {
          id: ID!
          name: String
          pet(times: Int = 1): String
          owner: People
        }

        type Cat implements Pet {
          id: ID!
          name: String
          "Cat ignores you and returns null"
          pet(times: Int = 1): String
          owner: People
        }

        type Dog implements Pet {
          id: ID!
          name: String
          "Dog arf x times."
          pet(times: Int = 1): String
          owner: People
        }

        """
        1. Basic mutation
        2. Loading state change and query refetches
        3. Optimistic updates
        """
        type Mutation {
          takePet(people: ID!, pet: ID!): Pet!
          dropPet(people: ID!, pet: ID!): Pet!

          createPeople(name: String!): People!

          createDog(name: String!): Dog!
          renameDog(id: ID!, name: String!): Dog!

          createCat(name: String!): Cat!
          renameCat(id: ID!, name: String!): Cat!
        }

        """
        1. Triggered by mutation
        2. Triggered externally
        3. Normalized cache update
        """
        type Subscription {
          peopleChanged: PeopleChangeEvent!

          # pet never changes, people change.
          # petChanged: PetChangeEvent!
        }

        type PeopleChangeEvent {
          type: ChangeEventType!
          people: People!
        }

        enum ChangeEventType {
          CREATED
          UPDATED
          DELETED
        }
      `,
    },
  });
};

export type TestClientOptions = {
  schema: Parameters<typeof createSchema>[0];
  cache?: Cache;
  onFetch?: (payload: QueryPayload) => void | Promise<void>;
};

/**
 * A local GQty client that resolve values in-memory without actually fetching.
 */
export const createInMemoryClient = async <TSchema extends BaseGeneratedSchema>(
  options: TestClientOptions
): Promise<GQtyClient<TSchema>> => {
  const schema = createSchema(options.schema);
  const yoga = createYoga({ schema });
  const executor = buildHTTPExecutor({ fetch: yoga.fetch });

  // We cannot generate client schema on-the-fly because of circular dependency,
  // it has to be pre-generated.
  // const { generate } = await import('@gqty/cli');
  // const { generatedSchema, scalarsEnumsHash } = await generate(schema);

  const { generatedSchema, scalarsEnumsHash } = await import(
    './schema.generated'
  );

  return createClient<TSchema>({
    schema: generatedSchema,
    scalars: scalarsEnumsHash,
    cache: options.cache ?? new Cache(),
    fetchOptions: {
      fetcher: async ({ query, variables, operationName }) => {
        await options.onFetch?.({ query, variables, operationName });

        const res = await executor({
          document: parse(query),
          variables,
          operationName,
        });

        return res as never;
      },
      subscriber: new MockWsClient(executor),
    },
  });
};

type AsyncExecutor = ReturnType<typeof buildHTTPExecutor>;

class MockWsClient implements Client {
  #activeSubscriptions = new Set<Promise<unknown>>();

  constructor(private readonly executor: AsyncExecutor) {}

  terminate() {
    this.#activeSubscriptions.clear();
  }

  dispose() {
    this.#activeSubscriptions.clear();
  }

  on() {
    // noop for mock clients
    return () => {};
  }

  subscribe<Data = Record<string, unknown>, Extensions = unknown>(
    { query, variables, operationName, extensions }: SubscribePayload,
    sink: Sink<ExecutionResult<Data, Extensions>>
  ): () => void {
    const ret = this.executor({
      document: parse(query),
      variables: variables ?? undefined,
      operationName: operationName ?? undefined,
      extensions: extensions ?? undefined,
    }).then(async (res) => {
      const it = res as AsyncIterable<ExecutionResult<Data, Extensions>>;

      for await (const data of it) {
        sink.next(data as never);

        if (!this.#activeSubscriptions.has(ret)) {
          return;
        }
      }

      sink.complete();
    });

    this.#activeSubscriptions.add(ret);

    return () => {
      this.#activeSubscriptions.delete(ret);
    };
  }

  iterate<
    Data = Record<string, unknown>,
    Extensions = unknown,
  >(): AsyncIterableIterator<ExecutionResult<Data, Extensions>> {
    throw new Error(
      `Iterate is not implemented because GQty only uses subscribe()`
    );
  }
}
