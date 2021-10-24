import { useGenerateGQty } from '@gqty/cli/envelop';
import { CreateApp } from '@graphql-ez/fastify';
import { ezAltairIDE } from '@graphql-ez/plugin-altair/static';
import { ezCodegen } from '@graphql-ez/plugin-codegen';
import { ezSchema } from '@graphql-ez/plugin-schema';
import Fastify, { LogLevel } from 'fastify';
import { random, range } from 'lodash';
import { generate } from 'randomstring';
import { gql } from 'test-utils';
import { GreetingsEnum, Human, TestUnion } from './ez.generated';

export const app = Fastify({
  logger: {
    level: 'warn' as LogLevel,
  },
});

const getUnion = (): TestUnion[] => [
  {
    a: 'asd',
  },
  {
    b: 123,
  },
  {
    c: GreetingsEnum.Hey,
  },
];

export const newHuman = ({ name }: { name?: string } = {}): Partial<Human> => {
  return {
    name: name || generate(),
    union: getUnion(),
  };
};

export const ezApp = CreateApp({
  ez: {
    plugins: [
      ezCodegen({
        outputSchema: true,
        config: {
          documents: 'src/graphql/operations.gql',
        },
        enableCodegen: true,
      }),
      ezSchema(),
      ezAltairIDE(),
    ],
  },
  envelop: {
    plugins: [useGenerateGQty()],
  },
  prepare({ registerTypeDefs, registerResolvers }) {
    let inc = 0;
    registerTypeDefs(gql`
      interface NamedEntity {
        name: String!
      }
      scalar ExampleScalar

      enum GreetingsEnum {
        Hello
        Hi
        Hey
      }
      input GreetingsInput {
        language: String!
        value: String
        scal: ExampleScalar
      }
      type Query {
        simpleString: String!
        stringWithArgs(hello: String!): String!
        stringNullableWithArgs(hello: String!, helloTwo: String): String
        stringNullableWithArgsArray(hello: [String]!): String
        object: Human
        objectArray: [Human]
        objectWithArgs(who: String!): Human!
        arrayString: [String!]!
        arrayObjectArgs(limit: Int!): [Human!]!
        greetings: GreetingsEnum!
        giveGreetingsInput(input: GreetingsInput!): String!
        number: Int!
        union: [TestUnion!]!
      }
      type Mutation {
        increment(n: Int!): Int!
      }
      type Human implements NamedEntity {
        name: String!
        father: Human!
        fieldWithArgs(id: Int!): Int!
        sons: [Human!]
        union: [TestUnion!]!
        args(a: String): Int
      }
      type Dog implements NamedEntity {
        name: String!
        owner: Human!
      }
      type A {
        a: String!
        common(a: String): Int
        z: String
      }
      type B {
        b: Int!
        common(b: Int): String
        z: String
      }
      type C {
        c: GreetingsEnum!
        z: String
      }
      union TestUnion = A | B | C
    `);
    registerResolvers({
      Query: {
        simpleString() {
          return generate();
        },
        stringWithArgs(_root, { hello }) {
          return hello;
        },
        object() {
          return newHuman();
        },
        objectArray() {
          return range(random(2, 3)).map(() => newHuman());
        },
        objectWithArgs(_root, { who }) {
          return newHuman({ name: who });
        },
        arrayString() {
          return range(random(1, 2)).map(() => generate());
        },
        arrayObjectArgs(_root, { limit }) {
          return range(limit).map(() => newHuman());
        },
        giveGreetingsInput(_root, { input }) {
          return input.language;
        },
        greetings() {
          return GreetingsEnum.Hello;
        },
        stringNullableWithArgs(_root, { hello, helloTwo }) {
          return hello || helloTwo;
        },
        stringNullableWithArgsArray(_root, { hello }) {
          return hello[0];
        },
        number() {
          return inc;
        },
        union() {
          return getUnion();
        },
      },
      Mutation: {
        increment(_root, { n }) {
          return (inc += n);
        },
      },
      Human: {
        father() {
          return newHuman();
        },
        fieldWithArgs(_root, { id }) {
          return id;
        },
        sons() {
          return range(random(2, 3)).map(() => newHuman());
        },
      },
      TestUnion: {
        __resolveType(obj) {
          if ('a' in obj) return 'A';
          if ('b' in obj) return 'B';
          return 'C';
        },
      },
    });
  },
});

app.register(ezApp.buildApp().fastifyPlugin);
