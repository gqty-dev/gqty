import { createTestApp, gql } from 'test-utils';
import { generate } from '../src';
import './utils';
export const clientPreComment = '';

test('basic functionality works', async () => {
  const { getEnveloped } = await createTestApp({
    schema: {
      typeDefs: gql`
        "Query"
        type Query {
          "Hello field"
          hello: String!
          deprecatedArg(arg: Int = 123): Int @deprecated
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

  const shouldBeIncluded = '// This should be included';

  const { schemaCode, clientCode, generatedSchema, scalarsEnumsHash } =
    await generate(getEnveloped().schema, {
      preImport: `
        ${shouldBeIncluded}
        `,
      react: true,
      subscriptions: true,
    });

  expect(schemaCode).toMatchInlineSnapshot(`
    "/**
     * GQTY AUTO-GENERATED CODE: PLEASE DO NOT MODIFY MANUALLY
     */

    // This should be included

    export type Maybe<T> = T | null;
    export type InputMaybe<T> = Maybe<T>;
    export type Exact<T extends { [key: string]: unknown }> = {
      [K in keyof T]: T[K];
    };
    export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
      [SubKey in K]?: Maybe<T[SubKey]>;
    };
    export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
      [SubKey in K]: Maybe<T[SubKey]>;
    };
    /** All built-in and custom scalars, mapped to their actual values */
    export interface Scalars {
      ID: string;
      String: string;
      Boolean: boolean;
      Int: number;
      Float: number;
    }

    export const scalarsEnumsHash: import('gqty').ScalarsEnumsHash = {
      Boolean: true,
      Int: true,
      String: true,
    };
    export const generatedSchema = {
      mutation: {},
      query: {
        __typename: { __type: 'String!' },
        deprecatedArg: { __type: 'Int', __args: { arg: 'Int' } },
        hello: { __type: 'String!' },
      },
      subscription: {},
    } as const;

    export interface Mutation {
      __typename?: 'Mutation';
    }

    /**
     * Query
     */
    export interface Query {
      __typename?: 'Query';
      /**
       * @deprecated No longer supported
       */
      deprecatedArg: (args?: {
        /**
         * @defaultValue \`123\`
         */
        arg?: Maybe<Scalars['Int']>;
      }) => Maybe<ScalarsEnums['Int']>;
      /**
       * Hello field
       */
      hello: ScalarsEnums['String'];
    }

    export interface Subscription {
      __typename?: 'Subscription';
    }

    export interface SchemaObjectTypes {
      Mutation: Mutation;
      Query: Query;
      Subscription: Subscription;
    }
    export type SchemaObjectTypesNames = 'Mutation' | 'Query' | 'Subscription';

    export interface GeneratedSchema {
      query: Query;
      mutation: Mutation;
      subscription: Subscription;
    }

    export type MakeNullable<T> = {
      [K in keyof T]: T[K] | undefined;
    };

    export interface ScalarsEnums extends MakeNullable<Scalars> {}
    "
  `);

  expect(clientCode).toMatchInlineSnapshot(`
    "/**
     * GQTY: You can safely modify this file and Query Fetcher based on your needs
     */

    import { createReactClient } from '@gqty/react';
    import { createSubscriptionsClient } from '@gqty/subscriptions';
    import type { QueryFetcher } from 'gqty';
    import { createClient } from 'gqty';
    import type {
      GeneratedSchema,
      SchemaObjectTypes,
      SchemaObjectTypesNames,
    } from './schema.generated';
    import { generatedSchema, scalarsEnumsHash } from './schema.generated';

    const queryFetcher: QueryFetcher = async function (query, variables) {
      // Modify \\"/api/graphql\\" if needed
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables,
        }),
        mode: 'cors',
      });

      const json = await response.json();

      return json;
    };

    const subscriptionsClient =
      typeof window !== 'undefined'
        ? createSubscriptionsClient({
            wsEndpoint: () => {
              // Modify if needed
              const url = new URL('/api/graphql', window.location.href);
              url.protocol = url.protocol.replace('http', 'ws');
              return url.href;
            },
          })
        : undefined;

    export const client = createClient<
      GeneratedSchema,
      SchemaObjectTypesNames,
      SchemaObjectTypes
    >({
      schema: generatedSchema,
      scalarsEnumsHash,
      queryFetcher,
      subscriptionsClient,
    });

    const { query, mutation, mutate, subscription, resolved, refetch, track } =
      client;

    export { query, mutation, mutate, subscription, resolved, refetch, track };

    const {
      graphql,
      useQuery,
      usePaginatedQuery,
      useTransactionQuery,
      useLazyQuery,
      useRefetch,
      useMutation,
      useMetaState,
      prepareReactRender,
      useHydrateCache,
      prepareQuery,
      useSubscription,
    } = createReactClient<GeneratedSchema>(client, {
      defaults: {
        // Set this flag as \\"true\\" if your usage involves React Suspense
        // Keep in mind that you can overwrite it in a per-hook basis
        suspense: false,

        // Set this flag based on your needs
        staleWhileRevalidate: false,
      },
    });

    export {
      graphql,
      useQuery,
      usePaginatedQuery,
      useTransactionQuery,
      useLazyQuery,
      useRefetch,
      useMutation,
      useMetaState,
      prepareReactRender,
      useHydrateCache,
      prepareQuery,
      useSubscription,
    };

    export * from './schema.generated';
    "
  `);

  expect(JSON.stringify(generatedSchema, null, 2)).toMatchInlineSnapshot(`
    "{
      \\"query\\": {
        \\"__typename\\": {
          \\"__type\\": \\"String!\\"
        },
        \\"deprecatedArg\\": {
          \\"__type\\": \\"Int\\",
          \\"__args\\": {
            \\"arg\\": \\"Int\\"
          }
        },
        \\"hello\\": {
          \\"__type\\": \\"String!\\"
        }
      },
      \\"mutation\\": {},
      \\"subscription\\": {}
    }"
  `);

  expect(JSON.stringify(scalarsEnumsHash, null, 2)).toMatchInlineSnapshot(`
    "{
      \\"Boolean\\": true,
      \\"Int\\": true,
      \\"String\\": true
    }"
  `);

  expect(clientCode.includes('= createReactClient')).toBeTruthy();

  expect(
    schemaCode
      .split('\n')
      .slice(3)
      .join('\n')
      .trim()
      .startsWith(shouldBeIncluded)
  ).toBeTruthy();
});

test('custom scalars works', async () => {
  const { getEnveloped } = await createTestApp({
    schema: {
      typeDefs: gql`
        scalar Custom
        type Query {
          hello: Custom!
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

  const { schemaCode, clientCode, generatedSchema, scalarsEnumsHash } =
    await generate(getEnveloped().schema, {
      scalarTypes: {
        Custom: '"hello world"',
      },
    });

  expect(clientCode).toMatchInlineSnapshot(`
    "/**
     * GQTY: You can safely modify this file and Query Fetcher based on your needs
     */

    import { createReactClient } from '@gqty/react';

    import type { QueryFetcher } from 'gqty';
    import { createClient } from 'gqty';
    import type {
      GeneratedSchema,
      SchemaObjectTypes,
      SchemaObjectTypesNames,
    } from './schema.generated';
    import { generatedSchema, scalarsEnumsHash } from './schema.generated';

    const queryFetcher: QueryFetcher = async function (query, variables) {
      // Modify \\"/api/graphql\\" if needed
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables,
        }),
        mode: 'cors',
      });

      const json = await response.json();

      return json;
    };

    export const client = createClient<
      GeneratedSchema,
      SchemaObjectTypesNames,
      SchemaObjectTypes
    >({
      schema: generatedSchema,
      scalarsEnumsHash,
      queryFetcher,
    });

    const { query, mutation, mutate, subscription, resolved, refetch, track } =
      client;

    export { query, mutation, mutate, subscription, resolved, refetch, track };

    const {
      graphql,
      useQuery,
      usePaginatedQuery,
      useTransactionQuery,
      useLazyQuery,
      useRefetch,
      useMutation,
      useMetaState,
      prepareReactRender,
      useHydrateCache,
      prepareQuery,
    } = createReactClient<GeneratedSchema>(client, {
      defaults: {
        // Set this flag as \\"true\\" if your usage involves React Suspense
        // Keep in mind that you can overwrite it in a per-hook basis
        suspense: false,

        // Set this flag based on your needs
        staleWhileRevalidate: false,
      },
    });

    export {
      graphql,
      useQuery,
      usePaginatedQuery,
      useTransactionQuery,
      useLazyQuery,
      useRefetch,
      useMutation,
      useMetaState,
      prepareReactRender,
      useHydrateCache,
      prepareQuery,
    };

    export * from './schema.generated';
    "
  `);

  expect(schemaCode).toMatchInlineSnapshot(`
    "/**
     * GQTY AUTO-GENERATED CODE: PLEASE DO NOT MODIFY MANUALLY
     */

    export type Maybe<T> = T | null;
    export type InputMaybe<T> = Maybe<T>;
    export type Exact<T extends { [key: string]: unknown }> = {
      [K in keyof T]: T[K];
    };
    export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
      [SubKey in K]?: Maybe<T[SubKey]>;
    };
    export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
      [SubKey in K]: Maybe<T[SubKey]>;
    };
    /** All built-in and custom scalars, mapped to their actual values */
    export interface Scalars {
      ID: string;
      String: string;
      Boolean: boolean;
      Int: number;
      Float: number;
      Custom: 'hello world';
    }

    export const scalarsEnumsHash: import('gqty').ScalarsEnumsHash = {
      Boolean: true,
      Custom: true,
      String: true,
    };
    export const generatedSchema = {
      mutation: {},
      query: { __typename: { __type: 'String!' }, hello: { __type: 'Custom!' } },
      subscription: {},
    } as const;

    export interface Mutation {
      __typename?: 'Mutation';
    }

    export interface Query {
      __typename?: 'Query';
      hello: ScalarsEnums['Custom'];
    }

    export interface Subscription {
      __typename?: 'Subscription';
    }

    export interface SchemaObjectTypes {
      Mutation: Mutation;
      Query: Query;
      Subscription: Subscription;
    }
    export type SchemaObjectTypesNames = 'Mutation' | 'Query' | 'Subscription';

    export interface GeneratedSchema {
      query: Query;
      mutation: Mutation;
      subscription: Subscription;
    }

    export type MakeNullable<T> = {
      [K in keyof T]: T[K] | undefined;
    };

    export interface ScalarsEnums extends MakeNullable<Scalars> {}
    "
  `);

  expect(JSON.stringify(generatedSchema, null, 2)).toMatchInlineSnapshot(`
    "{
      \\"query\\": {
        \\"__typename\\": {
          \\"__type\\": \\"String!\\"
        },
        \\"hello\\": {
          \\"__type\\": \\"Custom!\\"
        }
      },
      \\"mutation\\": {},
      \\"subscription\\": {}
    }"
  `);

  expect(JSON.stringify(scalarsEnumsHash, null, 2)).toMatchInlineSnapshot(`
    "{
      \\"Boolean\\": true,
      \\"Custom\\": true,
      \\"String\\": true
    }"
  `);

  expect(
    schemaCode.includes(
      `
export interface Scalars {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Custom: 'hello world';
}
`.trim()
    )
  ).toBeTruthy();
});

describe('feature complete app', () => {
  const testAppPromise = createTestApp({
    schema: {
      typeDefs: gql`
        scalar ExampleScalar

        "Greetings Enum"
        enum GreetingsEnum {
          "Hello"
          Hello
          "Hi"
          Hi
          "Hey"
          Hey
          Bye @deprecated
        }
        enum OtherEnum {
          Other
        }
        "Greetings Input"
        input GreetingsInput {
          "Language"
          language: String!
          value: String = "Hello"
          scal: ExampleScalar
        }
        type Query {
          simpleString: String!
          stringWithArgs(hello: String!): String!
          stringNullableWithArgs(
            hello: String!
            helloTwo: String = "Hi"
          ): String
          stringNullableWithArgsArray(hello: [String]!): String
          object: Human
          objectArray: [Human]
          objectWithArgs("Who?" who: String!): Human!
          arrayString: [String!]!
          arrayObjectArgs(limit: Int = 10): [Human!]!
          greetings: GreetingsEnum!
          giveGreetingsInput(input: GreetingsInput!): String!
          enumsInput(
            nullableEnum: GreetingsEnum
            notNullableEnum: GreetingsEnum!
          ): GreetingsEnum
          number: Int!
          namedEntities: [NamedEntity!]!
          humanLike: HumanType!
        }
        type Mutation {
          increment(n: Int!): Int!
        }
        "Named Entity"
        interface NamedEntity {
          "Named Entity Name"
          name: String!
        }
        type Human implements NamedEntity {
          name: String!
          other: String
          father: Human!
          fieldWithArgs(id: Int!): Int!
          withArgs(a: Int!, b: Int): Int
          withArgs2(a: Int): Int!
        }
        type OtherHuman implements NamedEntity {
          name: String!
          other: String
          withArgs(a: Int!, b: Int): Int
          withArgs2(a: Int): Int!
          otherHumanStyle: String!
        }
        union HumanType = Human | OtherHuman
      `,
      resolvers: {},
    },
  });
  beforeAll(async () => {
    await testAppPromise;
  });
  test('generate works', async () => {
    const { getEnveloped } = await testAppPromise;
    const { schemaCode, generatedSchema, scalarsEnumsHash } = await generate(
      getEnveloped().schema
    );

    expect(schemaCode).toMatchInlineSnapshot(`
      "/**
       * GQTY AUTO-GENERATED CODE: PLEASE DO NOT MODIFY MANUALLY
       */

      import { SchemaUnionsKey } from 'gqty';

      export type Maybe<T> = T | null;
      export type InputMaybe<T> = Maybe<T>;
      export type Exact<T extends { [key: string]: unknown }> = {
        [K in keyof T]: T[K];
      };
      export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
        [SubKey in K]?: Maybe<T[SubKey]>;
      };
      export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
        [SubKey in K]: Maybe<T[SubKey]>;
      };
      /** All built-in and custom scalars, mapped to their actual values */
      export interface Scalars {
        ID: string;
        String: string;
        Boolean: boolean;
        Int: number;
        Float: number;
        ExampleScalar: any;
      }

      /** Greetings Enum */
      export enum GreetingsEnum {
        Bye = 'Bye',
        /** Hello */
        Hello = 'Hello',
        /** Hey */
        Hey = 'Hey',
        /** Hi */
        Hi = 'Hi',
      }

      /** Greetings Input */
      export interface GreetingsInput {
        /** Language */
        language: Scalars['String'];
        scal?: InputMaybe<Scalars['ExampleScalar']>;
        value?: InputMaybe<Scalars['String']>;
      }

      export enum OtherEnum {
        Other = 'Other',
      }

      export const scalarsEnumsHash: import('gqty').ScalarsEnumsHash = {
        Boolean: true,
        ExampleScalar: true,
        GreetingsEnum: true,
        Int: true,
        OtherEnum: true,
        String: true,
      };
      export const generatedSchema = {
        GreetingsInput: {
          language: { __type: 'String!' },
          scal: { __type: 'ExampleScalar' },
          value: { __type: 'String' },
        },
        Human: {
          __typename: { __type: 'String!' },
          father: { __type: 'Human!' },
          fieldWithArgs: { __type: 'Int!', __args: { id: 'Int!' } },
          name: { __type: 'String!' },
          other: { __type: 'String' },
          withArgs: { __type: 'Int', __args: { a: 'Int!', b: 'Int' } },
          withArgs2: { __type: 'Int!', __args: { a: 'Int' } },
        },
        HumanType: {
          __typename: { __type: 'String!' },
          $on: { __type: '$HumanType!' },
        },
        NamedEntity: {
          __typename: { __type: 'String!' },
          name: { __type: 'String!' },
          $on: { __type: '$NamedEntity!' },
        },
        OtherHuman: {
          __typename: { __type: 'String!' },
          name: { __type: 'String!' },
          other: { __type: 'String' },
          otherHumanStyle: { __type: 'String!' },
          withArgs: { __type: 'Int', __args: { a: 'Int!', b: 'Int' } },
          withArgs2: { __type: 'Int!', __args: { a: 'Int' } },
        },
        mutation: {
          __typename: { __type: 'String!' },
          increment: { __type: 'Int!', __args: { n: 'Int!' } },
        },
        query: {
          __typename: { __type: 'String!' },
          arrayObjectArgs: { __type: '[Human!]!', __args: { limit: 'Int' } },
          arrayString: { __type: '[String!]!' },
          enumsInput: {
            __type: 'GreetingsEnum',
            __args: {
              notNullableEnum: 'GreetingsEnum!',
              nullableEnum: 'GreetingsEnum',
            },
          },
          giveGreetingsInput: {
            __type: 'String!',
            __args: { input: 'GreetingsInput!' },
          },
          greetings: { __type: 'GreetingsEnum!' },
          humanLike: { __type: 'HumanType!' },
          namedEntities: { __type: '[NamedEntity!]!' },
          number: { __type: 'Int!' },
          object: { __type: 'Human' },
          objectArray: { __type: '[Human]' },
          objectWithArgs: { __type: 'Human!', __args: { who: 'String!' } },
          simpleString: { __type: 'String!' },
          stringNullableWithArgs: {
            __type: 'String',
            __args: { hello: 'String!', helloTwo: 'String' },
          },
          stringNullableWithArgsArray: {
            __type: 'String',
            __args: { hello: '[String]!' },
          },
          stringWithArgs: { __type: 'String!', __args: { hello: 'String!' } },
        },
        subscription: {},
        [SchemaUnionsKey]: {
          NamedEntity: ['Human', 'OtherHuman'],
          HumanType: ['Human', 'OtherHuman'],
        },
      } as const;

      export interface Human {
        __typename?: 'Human';
        father: Human;
        fieldWithArgs: (args: { id: Scalars['Int'] }) => ScalarsEnums['Int'];
        name: ScalarsEnums['String'];
        other?: Maybe<ScalarsEnums['String']>;
        withArgs: (args: {
          a: Scalars['Int'];
          b?: Maybe<Scalars['Int']>;
        }) => Maybe<ScalarsEnums['Int']>;
        withArgs2: (args?: { a?: Maybe<Scalars['Int']> }) => ScalarsEnums['Int'];
      }

      export interface HumanType {
        __typename?: 'Human' | 'OtherHuman';
        $on: $HumanType;
      }

      /**
       * Named Entity
       */
      export interface NamedEntity {
        __typename?: 'Human' | 'OtherHuman';
        /**
         * Named Entity Name
         */
        name: ScalarsEnums['String'];
        $on: $NamedEntity;
      }

      export interface OtherHuman {
        __typename?: 'OtherHuman';
        name: ScalarsEnums['String'];
        other?: Maybe<ScalarsEnums['String']>;
        otherHumanStyle: ScalarsEnums['String'];
        withArgs: (args: {
          a: Scalars['Int'];
          b?: Maybe<Scalars['Int']>;
        }) => Maybe<ScalarsEnums['Int']>;
        withArgs2: (args?: { a?: Maybe<Scalars['Int']> }) => ScalarsEnums['Int'];
      }

      export interface Mutation {
        __typename?: 'Mutation';
        increment: (args: { n: Scalars['Int'] }) => ScalarsEnums['Int'];
      }

      export interface Query {
        __typename?: 'Query';
        arrayObjectArgs: (args?: {
          /**
           * @defaultValue \`10\`
           */
          limit?: Maybe<Scalars['Int']>;
        }) => Array<Human>;
        arrayString: Array<ScalarsEnums['String']>;
        enumsInput: (args: {
          notNullableEnum: GreetingsEnum;
          nullableEnum?: Maybe<GreetingsEnum>;
        }) => Maybe<ScalarsEnums['GreetingsEnum']>;
        giveGreetingsInput: (args: {
          input: GreetingsInput;
        }) => ScalarsEnums['String'];
        greetings: ScalarsEnums['GreetingsEnum'];
        humanLike: HumanType;
        namedEntities: Array<NamedEntity>;
        number: ScalarsEnums['Int'];
        object?: Maybe<Human>;
        objectArray?: Maybe<Array<Maybe<Human>>>;
        objectWithArgs: (args: {
          /**
           * Who?
           */
          who: Scalars['String'];
        }) => Human;
        simpleString: ScalarsEnums['String'];
        stringNullableWithArgs: (args: {
          hello: Scalars['String'];
          /**
           * @defaultValue \`\\"Hi\\"\`
           */
          helloTwo?: Maybe<Scalars['String']>;
        }) => Maybe<ScalarsEnums['String']>;
        stringNullableWithArgsArray: (args: {
          hello: Array<Maybe<Scalars['String']>>;
        }) => Maybe<ScalarsEnums['String']>;
        stringWithArgs: (args: {
          hello: Scalars['String'];
        }) => ScalarsEnums['String'];
      }

      export interface Subscription {
        __typename?: 'Subscription';
      }

      export interface SchemaObjectTypes {
        Human: Human;
        Mutation: Mutation;
        OtherHuman: OtherHuman;
        Query: Query;
        Subscription: Subscription;
      }
      export type SchemaObjectTypesNames =
        | 'Human'
        | 'Mutation'
        | 'OtherHuman'
        | 'Query'
        | 'Subscription';

      export interface $HumanType {
        Human?: Human;
        OtherHuman?: OtherHuman;
      }

      export interface $NamedEntity {
        Human?: Human;
        OtherHuman?: OtherHuman;
      }

      export interface GeneratedSchema {
        query: Query;
        mutation: Mutation;
        subscription: Subscription;
      }

      export type MakeNullable<T> = {
        [K in keyof T]: T[K] | undefined;
      };

      export interface ScalarsEnums extends MakeNullable<Scalars> {
        GreetingsEnum: GreetingsEnum | undefined;
        OtherEnum: OtherEnum | undefined;
      }
      "
    `);
    expect(generatedSchema).toMatchInlineSnapshot(`
      {
        "GreetingsInput": {
          "language": {
            "__type": "String!",
          },
          "scal": {
            "__type": "ExampleScalar",
          },
          "value": {
            "__type": "String",
          },
        },
        "Human": {
          "__typename": {
            "__type": "String!",
          },
          "father": {
            "__type": "Human!",
          },
          "fieldWithArgs": {
            "__args": {
              "id": "Int!",
            },
            "__type": "Int!",
          },
          "name": {
            "__type": "String!",
          },
          "other": {
            "__type": "String",
          },
          "withArgs": {
            "__args": {
              "a": "Int!",
              "b": "Int",
            },
            "__type": "Int",
          },
          "withArgs2": {
            "__args": {
              "a": "Int",
            },
            "__type": "Int!",
          },
        },
        "HumanType": {
          "$on": {
            "__type": "$HumanType!",
          },
          "__typename": {
            "__type": "String!",
          },
        },
        "NamedEntity": {
          "$on": {
            "__type": "$NamedEntity!",
          },
          "__typename": {
            "__type": "String!",
          },
          "name": {
            "__type": "String!",
          },
        },
        "OtherHuman": {
          "__typename": {
            "__type": "String!",
          },
          "name": {
            "__type": "String!",
          },
          "other": {
            "__type": "String",
          },
          "otherHumanStyle": {
            "__type": "String!",
          },
          "withArgs": {
            "__args": {
              "a": "Int!",
              "b": "Int",
            },
            "__type": "Int",
          },
          "withArgs2": {
            "__args": {
              "a": "Int",
            },
            "__type": "Int!",
          },
        },
        "mutation": {
          "__typename": {
            "__type": "String!",
          },
          "increment": {
            "__args": {
              "n": "Int!",
            },
            "__type": "Int!",
          },
        },
        "query": {
          "__typename": {
            "__type": "String!",
          },
          "arrayObjectArgs": {
            "__args": {
              "limit": "Int",
            },
            "__type": "[Human!]!",
          },
          "arrayString": {
            "__type": "[String!]!",
          },
          "enumsInput": {
            "__args": {
              "notNullableEnum": "GreetingsEnum!",
              "nullableEnum": "GreetingsEnum",
            },
            "__type": "GreetingsEnum",
          },
          "giveGreetingsInput": {
            "__args": {
              "input": "GreetingsInput!",
            },
            "__type": "String!",
          },
          "greetings": {
            "__type": "GreetingsEnum!",
          },
          "humanLike": {
            "__type": "HumanType!",
          },
          "namedEntities": {
            "__type": "[NamedEntity!]!",
          },
          "number": {
            "__type": "Int!",
          },
          "object": {
            "__type": "Human",
          },
          "objectArray": {
            "__type": "[Human]",
          },
          "objectWithArgs": {
            "__args": {
              "who": "String!",
            },
            "__type": "Human!",
          },
          "simpleString": {
            "__type": "String!",
          },
          "stringNullableWithArgs": {
            "__args": {
              "hello": "String!",
              "helloTwo": "String",
            },
            "__type": "String",
          },
          "stringNullableWithArgsArray": {
            "__args": {
              "hello": "[String]!",
            },
            "__type": "String",
          },
          "stringWithArgs": {
            "__args": {
              "hello": "String!",
            },
            "__type": "String!",
          },
        },
        "subscription": {},
        Symbol(unionsKey): {
          "HumanType": [
            "Human",
            "OtherHuman",
          ],
          "NamedEntity": [
            "Human",
            "OtherHuman",
          ],
        },
      }
    `);
    expect(scalarsEnumsHash).toMatchInlineSnapshot(`
      {
        "Boolean": true,
        "ExampleScalar": true,
        "GreetingsEnum": true,
        "Int": true,
        "OtherEnum": true,
        "String": true,
      }
    `);
  });
});

test('prettier detects invalid code', async () => {
  const { getEnveloped } = await createTestApp({
    schema: {
      typeDefs: gql`
        type Query {
          hello: String!
        }
      `,
    },
  });

  await expect(
    generate(getEnveloped().schema, {
      preImport: `
        con a; // invalid code
        `,
    }).catch((err) => err.message.split('\n')[0])
  ).resolves.toBe(`Unexpected keyword or identifier. (6:9)`);
});

describe('mutation', () => {
  const testAppPromise = createTestApp({
    schema: {
      typeDefs: gql`
        type Query {
          hello: String!
        }
        type Mutation {
          helloMutation(hello: String!): String!
        }
      `,
      resolvers: {
        Mutation: {
          helloMutation(_root, { hello }: { hello: string }) {
            return hello;
          },
        },
      },
    },
  });

  beforeAll(async () => {
    await testAppPromise;
  });

  test('generates mutation', async () => {
    const { getEnveloped } = await testAppPromise;
    const { schemaCode, generatedSchema, scalarsEnumsHash } = await generate(
      getEnveloped().schema
    );

    expect(schemaCode).toMatchInlineSnapshot(`
      "/**
       * GQTY AUTO-GENERATED CODE: PLEASE DO NOT MODIFY MANUALLY
       */

      export type Maybe<T> = T | null;
      export type InputMaybe<T> = Maybe<T>;
      export type Exact<T extends { [key: string]: unknown }> = {
        [K in keyof T]: T[K];
      };
      export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
        [SubKey in K]?: Maybe<T[SubKey]>;
      };
      export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
        [SubKey in K]: Maybe<T[SubKey]>;
      };
      /** All built-in and custom scalars, mapped to their actual values */
      export interface Scalars {
        ID: string;
        String: string;
        Boolean: boolean;
        Int: number;
        Float: number;
      }

      export const scalarsEnumsHash: import('gqty').ScalarsEnumsHash = {
        Boolean: true,
        String: true,
      };
      export const generatedSchema = {
        mutation: {
          __typename: { __type: 'String!' },
          helloMutation: { __type: 'String!', __args: { hello: 'String!' } },
        },
        query: { __typename: { __type: 'String!' }, hello: { __type: 'String!' } },
        subscription: {},
      } as const;

      export interface Mutation {
        __typename?: 'Mutation';
        helloMutation: (args: { hello: Scalars['String'] }) => ScalarsEnums['String'];
      }

      export interface Query {
        __typename?: 'Query';
        hello: ScalarsEnums['String'];
      }

      export interface Subscription {
        __typename?: 'Subscription';
      }

      export interface SchemaObjectTypes {
        Mutation: Mutation;
        Query: Query;
        Subscription: Subscription;
      }
      export type SchemaObjectTypesNames = 'Mutation' | 'Query' | 'Subscription';

      export interface GeneratedSchema {
        query: Query;
        mutation: Mutation;
        subscription: Subscription;
      }

      export type MakeNullable<T> = {
        [K in keyof T]: T[K] | undefined;
      };

      export interface ScalarsEnums extends MakeNullable<Scalars> {}
      "
    `);
    expect(generatedSchema).toMatchInlineSnapshot(`
      {
        "mutation": {
          "__typename": {
            "__type": "String!",
          },
          "helloMutation": {
            "__args": {
              "hello": "String!",
            },
            "__type": "String!",
          },
        },
        "query": {
          "__typename": {
            "__type": "String!",
          },
          "hello": {
            "__type": "String!",
          },
        },
        "subscription": {},
      }
    `);
    expect(scalarsEnumsHash).toMatchInlineSnapshot(`
      {
        "Boolean": true,
        "String": true,
      }
    `);
  });
});

describe('subscription', () => {
  const testAppPromise = createTestApp({
    schema: {
      typeDefs: gql`
        type Query {
          hello: String!
        }
        type Subscription {
          newNotification: String!
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

  beforeAll(async () => {
    await testAppPromise;
  });

  test('generates subscription', async () => {
    const { getEnveloped } = await testAppPromise;
    const { schemaCode, generatedSchema, scalarsEnumsHash } = await generate(
      getEnveloped().schema
    );

    expect(schemaCode).toMatchInlineSnapshot(`
      "/**
       * GQTY AUTO-GENERATED CODE: PLEASE DO NOT MODIFY MANUALLY
       */

      export type Maybe<T> = T | null;
      export type InputMaybe<T> = Maybe<T>;
      export type Exact<T extends { [key: string]: unknown }> = {
        [K in keyof T]: T[K];
      };
      export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
        [SubKey in K]?: Maybe<T[SubKey]>;
      };
      export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
        [SubKey in K]: Maybe<T[SubKey]>;
      };
      /** All built-in and custom scalars, mapped to their actual values */
      export interface Scalars {
        ID: string;
        String: string;
        Boolean: boolean;
        Int: number;
        Float: number;
      }

      export const scalarsEnumsHash: import('gqty').ScalarsEnumsHash = {
        Boolean: true,
        String: true,
      };
      export const generatedSchema = {
        mutation: {},
        query: { __typename: { __type: 'String!' }, hello: { __type: 'String!' } },
        subscription: {
          __typename: { __type: 'String!' },
          newNotification: { __type: 'String!' },
        },
      } as const;

      export interface Mutation {
        __typename?: 'Mutation';
      }

      export interface Query {
        __typename?: 'Query';
        hello: ScalarsEnums['String'];
      }

      export interface Subscription {
        __typename?: 'Subscription';
        newNotification: ScalarsEnums['String'];
      }

      export interface SchemaObjectTypes {
        Mutation: Mutation;
        Query: Query;
        Subscription: Subscription;
      }
      export type SchemaObjectTypesNames = 'Mutation' | 'Query' | 'Subscription';

      export interface GeneratedSchema {
        query: Query;
        mutation: Mutation;
        subscription: Subscription;
      }

      export type MakeNullable<T> = {
        [K in keyof T]: T[K] | undefined;
      };

      export interface ScalarsEnums extends MakeNullable<Scalars> {}
      "
    `);
    expect(generatedSchema).toMatchInlineSnapshot(`
      {
        "mutation": {},
        "query": {
          "__typename": {
            "__type": "String!",
          },
          "hello": {
            "__type": "String!",
          },
        },
        "subscription": {
          "__typename": {
            "__type": "String!",
          },
          "newNotification": {
            "__type": "String!",
          },
        },
      }
    `);
    expect(scalarsEnumsHash).toMatchInlineSnapshot(`
      {
        "Boolean": true,
        "String": true,
      }
    `);
  });
});

test('javascript output works', async () => {
  const { getEnveloped } = await createTestApp({
    schema: {
      typeDefs: gql`
        type A {
          a: String
        }
        type B {
          b: Int
        }
        union C = A | B
        type Query {
          hello: String!
        }
        type Subscription {
          newNotification: String!
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

  const {
    isJavascriptOutput,
    clientCode,
    javascriptSchemaCode,
    generatedSchema,
    schemaCode,
  } = await generate(getEnveloped().schema, {
    react: true,
    subscriptions: true,
    javascriptOutput: true,
  });

  expect(isJavascriptOutput).toBe(true);

  expect(clientCode).toMatchInlineSnapshot(`
    "/**
     * GQTY: You can safely modify this file and Query Fetcher based on your needs
     */

    import { createReactClient } from '@gqty/react';
    import { createSubscriptionsClient } from '@gqty/subscriptions';

    import { createClient } from 'gqty';

    import { generatedSchema, scalarsEnumsHash } from './schema.generated';

    /**
     * @type {import(\\"gqty\\").QueryFetcher}
     */
    const queryFetcher = async function (query, variables) {
      // Modify \\"/api/graphql\\" if needed
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables,
        }),
        mode: 'cors',
      });

      const json = await response.json();

      return json;
    };

    const subscriptionsClient =
      typeof window !== 'undefined'
        ? createSubscriptionsClient({
            wsEndpoint: () => {
              // Modify if needed
              const url = new URL('/api/graphql', window.location.href);
              url.protocol = url.protocol.replace('http', 'ws');
              return url.href;
            },
          })
        : undefined;

    /**
     * @type {import(\\"gqty\\").GQtyClient<import(\\"./schema.generated\\").GeneratedSchema>}
     */
    export const client = createClient({
      schema: generatedSchema,
      scalarsEnumsHash,
      queryFetcher,
      subscriptionsClient,
    });

    const { query, mutation, mutate, subscription, resolved, refetch, track } =
      client;

    export { query, mutation, mutate, subscription, resolved, refetch, track };

    /**
     * @type {import(\\"@gqty/react\\").ReactClient<import(\\"./schema.generated\\").GeneratedSchema>}
     */
    const reactClient = createReactClient(client, {
      defaults: {
        // Set this flag as \\"true\\" if your usage involves React Suspense
        // Keep in mind that you can overwrite it in a per-hook basis
        suspense: false,

        // Set this flag based on your needs
        staleWhileRevalidate: false,
      },
    });

    const {
      graphql,
      useQuery,
      usePaginatedQuery,
      useTransactionQuery,
      useLazyQuery,
      useRefetch,
      useMutation,
      useMetaState,
      prepareReactRender,
      useHydrateCache,
      prepareQuery,
      useSubscription,
    } = reactClient;

    export {
      graphql,
      useQuery,
      usePaginatedQuery,
      useTransactionQuery,
      useLazyQuery,
      useRefetch,
      useMutation,
      useMetaState,
      prepareReactRender,
      useHydrateCache,
      prepareQuery,
      useSubscription,
    };

    export * from './schema.generated';
    "
  `);
  expect(javascriptSchemaCode).toMatchInlineSnapshot(`
    "/**
     * GQTY AUTO-GENERATED CODE: PLEASE DO NOT MODIFY MANUALLY
     */
    import { SchemaUnionsKey } from 'gqty';

    /**
     * @type {import(\\"gqty\\").ScalarsEnumsHash}
     */
    export const scalarsEnumsHash = { Boolean: true, Int: true, String: true };

    export const generatedSchema = {
      A: { __typename: { __type: 'String!' }, a: { __type: 'String' } },
      B: { __typename: { __type: 'String!' }, b: { __type: 'Int' } },
      C: { __typename: { __type: 'String!' }, $on: { __type: '$C!' } },
      mutation: {},
      query: { __typename: { __type: 'String!' }, hello: { __type: 'String!' } },
      subscription: {
        __typename: { __type: 'String!' },
        newNotification: { __type: 'String!' },
      },
      [SchemaUnionsKey]: { C: ['A', 'B'] },
    };
    "
  `);
  expect(generatedSchema).toMatchInlineSnapshot(`
    {
      "A": {
        "__typename": {
          "__type": "String!",
        },
        "a": {
          "__type": "String",
        },
      },
      "B": {
        "__typename": {
          "__type": "String!",
        },
        "b": {
          "__type": "Int",
        },
      },
      "C": {
        "$on": {
          "__type": "$C!",
        },
        "__typename": {
          "__type": "String!",
        },
      },
      "mutation": {},
      "query": {
        "__typename": {
          "__type": "String!",
        },
        "hello": {
          "__type": "String!",
        },
      },
      "subscription": {
        "__typename": {
          "__type": "String!",
        },
        "newNotification": {
          "__type": "String!",
        },
      },
      Symbol(unionsKey): {
        "C": [
          "A",
          "B",
        ],
      },
    }
  `);
  expect(schemaCode).toMatchInlineSnapshot(`
    "/**
     * GQTY AUTO-GENERATED CODE: PLEASE DO NOT MODIFY MANUALLY
     */

    import { SchemaUnionsKey } from 'gqty';

    export type Maybe<T> = T | null;
    export type InputMaybe<T> = Maybe<T>;
    export type Exact<T extends { [key: string]: unknown }> = {
      [K in keyof T]: T[K];
    };
    export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
      [SubKey in K]?: Maybe<T[SubKey]>;
    };
    export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
      [SubKey in K]: Maybe<T[SubKey]>;
    };
    /** All built-in and custom scalars, mapped to their actual values */
    export interface Scalars {
      ID: string;
      String: string;
      Boolean: boolean;
      Int: number;
      Float: number;
    }

    export declare const scalarsEnumsHash: import('gqty').ScalarsEnumsHash;
    export declare const generatedSchema: {
      A: { __typename: { __type: 'String!' }; a: { __type: 'String' } };
      B: { __typename: { __type: 'String!' }; b: { __type: 'Int' } };
      C: { __typename: { __type: 'String!' }; $on: { __type: '$C!' } };
      mutation: {};
      query: { __typename: { __type: 'String!' }; hello: { __type: 'String!' } };
      subscription: {
        __typename: { __type: 'String!' };
        newNotification: { __type: 'String!' };
      };
      [SchemaUnionsKey]: { C: ['A', 'B'] };
    };

    export interface A {
      __typename?: 'A';
      a?: Maybe<ScalarsEnums['String']>;
    }

    export interface B {
      __typename?: 'B';
      b?: Maybe<ScalarsEnums['Int']>;
    }

    export interface C {
      __typename?: 'A' | 'B';
      $on: $C;
    }

    export interface Mutation {
      __typename?: 'Mutation';
    }

    export interface Query {
      __typename?: 'Query';
      hello: ScalarsEnums['String'];
    }

    export interface Subscription {
      __typename?: 'Subscription';
      newNotification: ScalarsEnums['String'];
    }

    export interface SchemaObjectTypes {
      A: A;
      B: B;
      Mutation: Mutation;
      Query: Query;
      Subscription: Subscription;
    }
    export type SchemaObjectTypesNames =
      | 'A'
      | 'B'
      | 'Mutation'
      | 'Query'
      | 'Subscription';

    export interface $C {
      A?: A;
      B?: B;
    }

    export interface GeneratedSchema {
      query: Query;
      mutation: Mutation;
      subscription: Subscription;
    }

    export type MakeNullable<T> = {
      [K in keyof T]: T[K] | undefined;
    };

    export interface ScalarsEnums extends MakeNullable<Scalars> {}
    "
  `);
});

test('ignoreArgs transform', async () => {
  const { getEnveloped } = await createTestApp({
    schema: {
      typeDefs: gql`
        type Query {
          asd(optional1: String, optional2: Int): String!
          zxc(optional: String, required: Int!): Int
        }
      `,
    },
  });

  let isCalled = false;

  const {
    clientCode,
    generatedSchema,
    javascriptSchemaCode,
    schemaCode,
    scalarsEnumsHash,
  } = await generate(
    getEnveloped().schema,
    {},
    {
      ignoreArgs(field) {
        isCalled = true;
        expect(field.name).toBe('asd');
        expect(field.type.toString()).toBe('String!');
        return true;
      },
    }
  );

  expect(isCalled).toBe(true);

  expect(clientCode).toMatchInlineSnapshot(`
    "/**
     * GQTY: You can safely modify this file and Query Fetcher based on your needs
     */

    import { createReactClient } from '@gqty/react';

    import type { QueryFetcher } from 'gqty';
    import { createClient } from 'gqty';
    import type {
      GeneratedSchema,
      SchemaObjectTypes,
      SchemaObjectTypesNames,
    } from './schema.generated';
    import { generatedSchema, scalarsEnumsHash } from './schema.generated';

    const queryFetcher: QueryFetcher = async function (query, variables) {
      // Modify \\"/api/graphql\\" if needed
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables,
        }),
        mode: 'cors',
      });

      const json = await response.json();

      return json;
    };

    export const client = createClient<
      GeneratedSchema,
      SchemaObjectTypesNames,
      SchemaObjectTypes
    >({
      schema: generatedSchema,
      scalarsEnumsHash,
      queryFetcher,
    });

    const { query, mutation, mutate, subscription, resolved, refetch, track } =
      client;

    export { query, mutation, mutate, subscription, resolved, refetch, track };

    const {
      graphql,
      useQuery,
      usePaginatedQuery,
      useTransactionQuery,
      useLazyQuery,
      useRefetch,
      useMutation,
      useMetaState,
      prepareReactRender,
      useHydrateCache,
      prepareQuery,
    } = createReactClient<GeneratedSchema>(client, {
      defaults: {
        // Set this flag as \\"true\\" if your usage involves React Suspense
        // Keep in mind that you can overwrite it in a per-hook basis
        suspense: false,

        // Set this flag based on your needs
        staleWhileRevalidate: false,
      },
    });

    export {
      graphql,
      useQuery,
      usePaginatedQuery,
      useTransactionQuery,
      useLazyQuery,
      useRefetch,
      useMutation,
      useMetaState,
      prepareReactRender,
      useHydrateCache,
      prepareQuery,
    };

    export * from './schema.generated';
    "
  `);
  expect(generatedSchema).toMatchInlineSnapshot(`
    {
      "mutation": {},
      "query": {
        "__typename": {
          "__type": "String!",
        },
        "asd": {
          "__type": "String!",
        },
        "zxc": {
          "__args": {
            "optional": "String",
            "required": "Int!",
          },
          "__type": "Int",
        },
      },
      "subscription": {},
    }
  `);
  expect(javascriptSchemaCode).toMatchInlineSnapshot(`
    "/**
     * GQTY AUTO-GENERATED CODE: PLEASE DO NOT MODIFY MANUALLY
     */

    /**
     * @type {import(\\"gqty\\").ScalarsEnumsHash}
     */
    export const scalarsEnumsHash = { Boolean: true, Int: true, String: true };

    export const generatedSchema = {
      mutation: {},
      query: {
        __typename: { __type: 'String!' },
        asd: { __type: 'String!' },
        zxc: { __type: 'Int', __args: { optional: 'String', required: 'Int!' } },
      },
      subscription: {},
    };
    "
  `);
  expect(schemaCode).toMatchInlineSnapshot(`
    "/**
     * GQTY AUTO-GENERATED CODE: PLEASE DO NOT MODIFY MANUALLY
     */

    export type Maybe<T> = T | null;
    export type InputMaybe<T> = Maybe<T>;
    export type Exact<T extends { [key: string]: unknown }> = {
      [K in keyof T]: T[K];
    };
    export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
      [SubKey in K]?: Maybe<T[SubKey]>;
    };
    export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
      [SubKey in K]: Maybe<T[SubKey]>;
    };
    /** All built-in and custom scalars, mapped to their actual values */
    export interface Scalars {
      ID: string;
      String: string;
      Boolean: boolean;
      Int: number;
      Float: number;
    }

    export const scalarsEnumsHash: import('gqty').ScalarsEnumsHash = {
      Boolean: true,
      Int: true,
      String: true,
    };
    export const generatedSchema = {
      mutation: {},
      query: {
        __typename: { __type: 'String!' },
        asd: { __type: 'String!' },
        zxc: { __type: 'Int', __args: { optional: 'String', required: 'Int!' } },
      },
      subscription: {},
    } as const;

    export interface Mutation {
      __typename?: 'Mutation';
    }

    export interface Query {
      __typename?: 'Query';
      asd: ScalarsEnums['String'];
      zxc: (args: {
        optional?: Maybe<Scalars['String']>;
        required: Scalars['Int'];
      }) => Maybe<ScalarsEnums['Int']>;
    }

    export interface Subscription {
      __typename?: 'Subscription';
    }

    export interface SchemaObjectTypes {
      Mutation: Mutation;
      Query: Query;
      Subscription: Subscription;
    }
    export type SchemaObjectTypesNames = 'Mutation' | 'Query' | 'Subscription';

    export interface GeneratedSchema {
      query: Query;
      mutation: Mutation;
      subscription: Subscription;
    }

    export type MakeNullable<T> = {
      [K in keyof T]: T[K] | undefined;
    };

    export interface ScalarsEnums extends MakeNullable<Scalars> {}
    "
  `);
  expect(scalarsEnumsHash).toMatchInlineSnapshot(`
    {
      "Boolean": true,
      "Int": true,
      "String": true,
    }
  `);
});
