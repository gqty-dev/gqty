import { faker } from '@faker-js/faker';
import { useGenerateGQty } from '@gqty/cli/envelop';
import { CreateApp } from '@graphql-ez/fastify';
import { ezAltairIDE } from '@graphql-ez/plugin-altair/static';
import { ezCodegen } from '@graphql-ez/plugin-codegen';
import { ezDataLoader, InferDataLoader } from '@graphql-ez/plugin-dataloader';
import { ezSchema } from '@graphql-ez/plugin-schema';
import { ezUpload } from '@graphql-ez/plugin-upload';
import { ezWebSockets } from '@graphql-ez/plugin-websockets';
import { StrictInMemoryPubSub } from 'graphql-ez/pubsub';
import { Config, JsonDB } from 'node-json-db';
import type { Dog, Human } from './ez.generated';

const pubsub = new StrictInMemoryPubSub<{
  NOTIFICATION: {
    newNotification: string;
  };
}>();

faker.seed(2021);

export const {
  registerTypeDefs,
  gql,
  registerResolvers,
  registerDataLoader,
  buildApp,
} = CreateApp({
  path: '/api/graphql',
  ez: {
    plugins: [
      ezAltairIDE(),
      ezCodegen({
        outputSchema: true,
        config: {
          targetPath: './api/ez.generated.ts',
        },
      }),
      ezSchema(),
      ezUpload(),
      ezDataLoader(),
      ezWebSockets(),
    ],
  },
  envelop: {
    plugins: [useGenerateGQty()],
  },
});

const OwnerLoader = registerDataLoader('DogOwner', (DataLoader) => {
  return new DataLoader(async (keys: readonly string[]) => {
    const dogOwners: Record<string, string> = await db.getData('/dogOwners');
    const humans = await db.getData('/humans').then((humans: Human[]) =>
      humans.reduce((acum, human) => {
        acum[human.id] = human;
        return acum;
      }, {} as Record<string, Human>)
    );
    return keys.map((key) => {
      return humans[dogOwners[key]];
    });
  });
});

const HumanDogsLoader = registerDataLoader('HumanDogs', (DataLoader) => {
  return new DataLoader(async (keys: readonly string[]) => {
    const dogOwners: Record<number, number> = await db.getData('/dogOwners');

    const dogs = await db.getData('/dogs');

    const humanDogs = Object.entries(dogOwners).reduce(
      (acum, [dogId, humanId]) => {
        acum[humanId] ??= [];

        const dog = dogs.find((v: Dog) => v.id == dogId);
        if (dog) acum[humanId].push(dog);

        return acum;
      },
      {} as Record<string, Dog[]>
    );

    return keys.map((id) => {
      return humanDogs[id]?.map((dog) => dog);
    });
  });
});

declare module 'graphql-ez' {
  interface EZContext
    extends InferDataLoader<typeof OwnerLoader>,
      InferDataLoader<typeof HumanDogsLoader> {}
}

export const sleep = (amount: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, amount));

const db = new JsonDB(new Config('db.json', true, true, '/'));

// seed(2021);

const paginatedData: {
  id: string;
  name: string;
}[] = new Array(200).fill(0).map((_, index) => {
  return {
    id: index + '',
    name: faker.person.firstName(),
  };
});

db.push('/paginatedData', paginatedData, true);

const initialDogs = [
  { id: 1, name: 'a' },
  { id: 2, name: 'b' },
  { id: 3, name: 'c' },
  { id: 4, name: 'd' },
];
db.push('/dogs', initialDogs, true);

const initialHumans = [
  { id: 1, name: 'g' },
  { id: 2, name: 'h' },
];

db.push('/humans', initialHumans, true);

db.push('/dogOwners', {
  1: 1,
  2: 1,
  3: 2,
});

registerTypeDefs(gql`
  "Dog Type"
  type Dog {
    id: ID!
    name: String!
    owner: Human
  }
  "Human Type"
  type Human {
    id: ID!
    """
    Human Name
    """
    name: String!
    dogs: [Dog!]
    fieldWithArg(a: String = "Hello World"): Int @deprecated
  }
  "Query Type"
  type Query {
    "Expected Error!"
    expectedError: Boolean!
    expectedNullableError: Boolean
    thirdTry: Boolean!
    dogs: [Dog!]!
    time: String!
    stringList: [String!]!
    humans: [Human!]!
    human1: Human!
    human1Other: Human!
    paginatedHumans(
      "Paginated Humans Input"
      input: ConnectionArgs!
    ): HumansConnection!
    emptyScalarArray: [Int!]!
    emptyHumanArray: [Human!]!
  }
  "Mutation"
  type Mutation {
    renameDog(
      """
      Dog Id
      """
      id: ID!
      name: String!
    ): Dog
    renameHuman(id: ID!, name: String!): Human
    other(arg: inputTypeExample!): Int
    createHuman(id: ID!, name: String!): Human!
    sendNotification(message: String!): Boolean!
    uploadFile(file: Upload!): String!
  }
  type Subscription {
    newNotification: String!
  }

  "Input Type Example XD"
  input inputTypeExample {
    a: String!
    other: Int = 1
  }
  "Humans Connection"
  type HumansConnection {
    pageInfo: PageInfo!
    nodes: [Human!]!
  }
  """
  Page Info Object
  """
  type PageInfo {
    hasPreviousPage: Boolean!
    hasNextPage: Boolean!
    startCursor: String
    endCursor: String
  }
  "ConnectionArgs description!"
  input ConnectionArgs {
    first: Int
    after: String

    last: Int @deprecated(reason: "asd")
    before: String
  }
  union Species = Human | Dog
  "Dog Type"
  enum DogType {
    Big
    Small
    Other @deprecated
  }
`);

let nTries = 0;

export const readStreamToBuffer = async (rs: import('fs').ReadStream) => {
  const chunks: Uint8Array[] = [];
  for await (let chunk of rs) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
};

registerResolvers({
  Human: {
    dogs({ id }, _args, { HumanDogs }) {
      return HumanDogs.load(id);
    },
  },
  Dog: {
    owner({ id }, _args, { DogOwner }) {
      return DogOwner.load(id);
    },
  },
  Query: {
    emptyHumanArray: () => [],
    emptyScalarArray: () => [],
    humans() {
      return db.getData('/humans');
    },
    stringList() {
      return ['a', 'b', 'c'];
    },
    async dogs() {
      return db.getData('/dogs');
    },
    async time() {
      // await sleep(2500);
      return new Date().toISOString();
    },
    async expectedError() {
      throw Error('Expected error');
    },
    async expectedNullableError() {
      throw Error('Expected error');
    },
    async thirdTry() {
      if (++nTries >= 3) {
        nTries = 0;
        return true;
      }
      throw Error('nTries=' + nTries);
    },
    async human1() {
      const humans = await db.getData('/humans');
      return humans[0];
    },
    async human1Other() {
      const humans = await db.getData('/humans');
      return humans[0];
    },
    paginatedHumans(_root, { input: { after, first, last, before } }) {
      let nodes: { id: string; name: string }[];
      let startSlice: number;
      let endSlice: number;
      if (first != null) {
        if (after) {
          const foundIndex = paginatedData.findIndex((v) => v.id === after);
          if (foundIndex === -1) {
            nodes = [];
            startSlice = -1;
            endSlice = paginatedData.length + 1;
          } else {
            endSlice = foundIndex + 1 + first;
            nodes = paginatedData.slice(
              (startSlice = foundIndex + 1),
              endSlice
            );
          }
        } else {
          nodes = paginatedData.slice((startSlice = 0), (endSlice = first));
        }
      } else if (last != null) {
        if (before) {
          const foundIndex = paginatedData.findIndex((v) => v.id === before);
          if (foundIndex === -1) {
            nodes = [];
            startSlice = -1;
            endSlice = paginatedData.length + 1;
          } else {
            nodes = paginatedData.slice(
              (startSlice = Math.max(0, foundIndex - last)),
              (endSlice = foundIndex)
            );
          }
        } else {
          nodes = paginatedData.slice(
            (startSlice = paginatedData.length - last),
            (endSlice = paginatedData.length)
          );
        }
      } else {
        throw Error('You have to specify pagination arguments');
      }

      const startCursor = nodes[0]?.id;
      const endCursor = nodes[nodes.length - 1]?.id;

      const hasNextPage = endCursor
        ? paginatedData.findIndex((v) => v.id === endCursor) + 1 <
          paginatedData.length
        : false;

      const hasPreviousPage = startCursor
        ? paginatedData.findIndex((v) => v.id === startCursor) - 1 >= 0
        : false;

      return {
        nodes,
        pageInfo: {
          startCursor,
          endCursor,
          hasNextPage,
          hasPreviousPage,
        },
      };
    },
  },
  Mutation: {
    createHuman(_root, { id, name }) {
      initialHumans.push({ id: parseInt(id), name });
      db.push('/humans', initialHumans, true);

      return { id, name };
    },
    renameDog(_root, { id, name }) {
      const dog = initialDogs.find((v) => {
        return v.id + '' === id;
      });

      if (dog) {
        dog.name = name;
        db.push('/dogs', initialDogs, true);
        return {
          ...dog,
          id: dog.id + '',
        };
      }

      return null;
    },
    renameHuman(_root, { id, name }) {
      const human = initialHumans.find((v) => {
        return v.id + '' === id;
      });

      if (human) {
        human.name = name;
        db.push('/humans', initialHumans, true);
        return {
          ...human,
          id: human.id + '',
        };
      }

      return null;
    },
    sendNotification(_root, { message }: { message: string }, _ctx) {
      pubsub.publish('NOTIFICATION', {
        newNotification: message,
      });

      return true;
    },
    async uploadFile(_root, { file }) {
      const newfile = await file;

      const fileBuffer = await readStreamToBuffer(newfile.createReadStream());

      return fileBuffer.toString('base64');
    },
  },
  Subscription: {
    newNotification: {
      async *subscribe(_root, _args, _ctx) {
        const sub = pubsub.subscribe('NOTIFICATION');

        for await (const data of sub) {
          if (data.newNotification === 'ERROR') {
            throw Error('EXPECTED ERROR');
          } else {
            yield data;
          }
        }
      },
    },
  },
});
