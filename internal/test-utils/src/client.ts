import { generate } from '@gqty/cli';
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
import { DateResolver } from 'graphql-scalars';
import type { Client, Sink, SubscribePayload } from 'graphql-ws';
import { createPubSub, createSchema, createYoga } from 'graphql-yoga';
import type { GeneratedSchema } from './schema.generated.ts';

export type MockClientOptions = Omit<TestClientOptions, 'schema'>;

export const createMockClient = async (options?: MockClientOptions) => {
  type People = { name: string; pets: Set<Pet> };
  type Pet = { name?: string; owner?: People };

  const peoples = new Map<number, People>();
  const cats = new Map<number, Pet>();
  const dogs = new Map<number, Pet>();
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
        Date: DateResolver,
        Query: {
          now: () => new Date(),
          peoples: () => Array.from(peoples.values()),
          people: (_, { id }) => peoples.get(id),
          pet: (_, { id }) => cats.get(id) ?? dogs.get(id),
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
            const peopleObj = peoples.get(people);
            assert(peopleObj, `People ${people} not found`);

            const petObj = cats.get(pet) ?? dogs.get(pet);
            assert(petObj, `Pet ${pet} not found`);

            peopleObj.pets.add(petObj);

            pubsub.publish('people', {
              type: 'UPDATED',
              people: peopleObj,
            });

            return petObj;
          },
          dropPet: (_, { people, pet }) => {
            const peopleObj = peoples.get(people);
            assert(peopleObj, `People ${people} not found`);

            const petObj = cats.get(pet) ?? dogs.get(pet);
            assert(petObj, `Pet ${pet} not found`);

            peopleObj.pets.delete(petObj);

            pubsub.publish('people', {
              type: 'UPDATED',
              people: peopleObj,
            });

            return petObj;
          },
          createPeople: (_, { name }) => {
            const people = { name, pets: new Set<Pet>() };

            peoples.set(peoples.size + 1, people);

            pubsub.publish('people', {
              type: 'CREATED',
              people,
            });

            return people;
          },
          createDog: (_, { name }) => {
            const dog = { name };
            dogs.set(dogs.size + 1, dog);
            return dog;
          },
          createCat: (_, { name }) => {
            const cat = { name };
            cats.set(cats.size + 1, cat);
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
          createCat(name: String!): Cat!
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
  onFetch?: (payload: QueryPayload) => void;
};

/**
 * A local GQty client that resolve values in-memory without actually fetching.
 */
export const createInMemoryClient = async <TSchame extends BaseGeneratedSchema>(
  options: TestClientOptions
): Promise<GQtyClient<TSchame>> => {
  const schema = createSchema(options.schema);
  const yoga = createYoga({ schema });
  const executor = buildHTTPExecutor({ fetch: yoga.fetch });

  const { generatedSchema, scalarsEnumsHash } = await generate(schema);

  return createClient<TSchame>({
    schema: generatedSchema,
    scalars: scalarsEnumsHash,
    cache: options.cache ?? new Cache(),
    fetchOptions: {
      fetcher: async ({ query, variables, operationName }) => {
        options.onFetch?.({ query, variables, operationName });

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
