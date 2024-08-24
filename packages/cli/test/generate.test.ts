import assert from 'assert';
import { createTestApp, gql } from 'test-utils';
import { generate } from '../src/generate';
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
     * GQty AUTO-GENERATED CODE: PLEASE DO NOT MODIFY MANUALLY
     */

    // This should be included

    import { type ScalarsEnumsHash } from 'gqty';

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
    export type MakeEmpty<
      T extends { [key: string]: unknown },
      K extends keyof T
    > = { [_ in K]?: never };
    export type Incremental<T> =
      | T
      | {
          [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
        };
    /** All built-in and custom scalars, mapped to their actual values */
    export interface Scalars {
      ID: { input: string; output: string };
      String: { input: string; output: string };
      Boolean: { input: boolean; output: boolean };
      Int: { input: number; output: number };
      Float: { input: number; output: number };
    }

    export const scalarsEnumsHash: ScalarsEnumsHash = {
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
        arg?: Maybe<ScalarsEnums['Int']>;
      }) => Maybe<ScalarsEnums['Int']>;
      /**
       * Hello field
       */
      hello: ScalarsEnums['String'];
    }

    export interface Subscription {
      __typename?: 'Subscription';
    }

    export interface GeneratedSchema {
      query: Query;
      mutation: Mutation;
      subscription: Subscription;
    }

    export type ScalarsEnums = {
      [Key in keyof Scalars]: Scalars[Key] extends { output: unknown }
        ? Scalars[Key]['output']
        : never;
    } & {};
    "
  `);

  expect(clientCode).toMatchInlineSnapshot(`
    "/**
     * GQty: You can safely modify this file based on your needs.
     */

    import { createReactClient } from '@gqty/react';
    import { createSolidClient } from '@gqty/solid';
    import { createClient as createSubscriptionsClient } from 'graphql-ws';
    import {
      Cache,
      createClient,
      defaultResponseHandler,
      type QueryFetcher,
    } from 'gqty';
    import {
      generatedSchema,
      scalarsEnumsHash,
      type GeneratedSchema,
    } from './schema.generated';

    const queryFetcher: QueryFetcher = async function (
      { query, variables, operationName },
      fetchOptions
    ) {
      // Modify "/api/graphql" if needed
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables,
          operationName,
        }),
        mode: 'cors',
        ...fetchOptions,
      });

      return await defaultResponseHandler(response);
    };

    const subscriptionsClient =
      typeof window !== 'undefined'
        ? createSubscriptionsClient({
            lazy: true,
            url: () => {
              // Modify if needed
              const url = new URL('/api/graphql', window.location.href);
              url.protocol = url.protocol.replace('http', 'ws');
              return url.href;
            },
          })
        : undefined;

    const cache = new Cache(
      undefined,
      /**
       * Default option is immediate cache expiry but keep it for 5 minutes,
       * allowing soft refetches in background.
       */
      {
        maxAge: 0,
        staleWhileRevalidate: 5 * 60 * 1000,
        normalization: true,
      }
    );

    export const client = createClient<GeneratedSchema>({
      schema: generatedSchema,
      scalars: scalarsEnumsHash,
      cache,
      fetchOptions: {
        fetcher: queryFetcher,
        subscriber: subscriptionsClient,
      },
    });

    // Core functions
    export const { resolve, subscribe, schema } = client;

    // Legacy functions
    export const {
      query,
      mutation,
      mutate,
      subscription,
      resolved,
      refetch,
      track,
    } = client;

    export const {
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
        // Enable Suspense, you can override this option for each hook.
        suspense: true,
      },
    });

    export const { createQuery } = createSolidClient(client);

    export * from './schema.generated';
    "
  `);

  expect(JSON.stringify(generatedSchema, null, 2)).toMatchInlineSnapshot(`
    "{
      "query": {
        "__typename": {
          "__type": "String!"
        },
        "deprecatedArg": {
          "__type": "Int",
          "__args": {
            "arg": "Int"
          }
        },
        "hello": {
          "__type": "String!"
        }
      },
      "mutation": {},
      "subscription": {}
    }"
  `);

  expect(JSON.stringify(scalarsEnumsHash, null, 2)).toMatchInlineSnapshot(`
    "{
      "Boolean": true,
      "Int": true,
      "String": true
    }"
  `);

  expect(clientCode.includes('= createReactClient')).toBeTruthy();

  expect(schemaCode.split('\n')[4]).toStrictEqual(shouldBeIncluded);
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
     * GQty: You can safely modify this file based on your needs.
     */

    import { createReactClient } from '@gqty/react';
    import { createSolidClient } from '@gqty/solid';
    import {
      Cache,
      createClient,
      defaultResponseHandler,
      type QueryFetcher,
    } from 'gqty';
    import {
      generatedSchema,
      scalarsEnumsHash,
      type GeneratedSchema,
    } from './schema.generated';

    const queryFetcher: QueryFetcher = async function (
      { query, variables, operationName },
      fetchOptions
    ) {
      // Modify "/api/graphql" if needed
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables,
          operationName,
        }),
        mode: 'cors',
        ...fetchOptions,
      });

      return await defaultResponseHandler(response);
    };

    const cache = new Cache(
      undefined,
      /**
       * Default option is immediate cache expiry but keep it for 5 minutes,
       * allowing soft refetches in background.
       */
      {
        maxAge: 0,
        staleWhileRevalidate: 5 * 60 * 1000,
        normalization: true,
      }
    );

    export const client = createClient<GeneratedSchema>({
      schema: generatedSchema,
      scalars: scalarsEnumsHash,
      cache,
      fetchOptions: {
        fetcher: queryFetcher,
      },
    });

    // Core functions
    export const { resolve, subscribe, schema } = client;

    // Legacy functions
    export const {
      query,
      mutation,
      mutate,
      subscription,
      resolved,
      refetch,
      track,
    } = client;

    export const {
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
        // Enable Suspense, you can override this option for each hook.
        suspense: true,
      },
    });

    export const { createQuery } = createSolidClient(client);

    export * from './schema.generated';
    "
  `);

  expect(schemaCode).toMatchInlineSnapshot(`
    "/**
     * GQty AUTO-GENERATED CODE: PLEASE DO NOT MODIFY MANUALLY
     */

    import { type ScalarsEnumsHash } from 'gqty';

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
    export type MakeEmpty<
      T extends { [key: string]: unknown },
      K extends keyof T
    > = { [_ in K]?: never };
    export type Incremental<T> =
      | T
      | {
          [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
        };
    /** All built-in and custom scalars, mapped to their actual values */
    export interface Scalars {
      ID: { input: string; output: string };
      String: { input: string; output: string };
      Boolean: { input: boolean; output: boolean };
      Int: { input: number; output: number };
      Float: { input: number; output: number };
      Custom: { input: 'hello world'; output: 'hello world' };
    }

    export const scalarsEnumsHash: ScalarsEnumsHash = {
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

    export interface GeneratedSchema {
      query: Query;
      mutation: Mutation;
      subscription: Subscription;
    }

    export type ScalarsEnums = {
      [Key in keyof Scalars]: Scalars[Key] extends { output: unknown }
        ? Scalars[Key]['output']
        : never;
    } & {};
    "
  `);

  expect(JSON.stringify(generatedSchema, null, 2)).toMatchInlineSnapshot(`
    "{
      "query": {
        "__typename": {
          "__type": "String!"
        },
        "hello": {
          "__type": "Custom!"
        }
      },
      "mutation": {},
      "subscription": {}
    }"
  `);

  expect(JSON.stringify(scalarsEnumsHash, null, 2)).toMatchInlineSnapshot(`
    "{
      "Boolean": true,
      "Custom": true,
      "String": true
    }"
  `);
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
            helloThree: String! = "Hi"
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
       * GQty AUTO-GENERATED CODE: PLEASE DO NOT MODIFY MANUALLY
       */

      import { SchemaUnionsKey, type ScalarsEnumsHash } from 'gqty';

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
      export type MakeEmpty<
        T extends { [key: string]: unknown },
        K extends keyof T
      > = { [_ in K]?: never };
      export type Incremental<T> =
        | T
        | {
            [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
          };
      /** All built-in and custom scalars, mapped to their actual values */
      export interface Scalars {
        ID: { input: string; output: string };
        String: { input: string; output: string };
        Boolean: { input: boolean; output: boolean };
        Int: { input: number; output: number };
        Float: { input: number; output: number };
        ExampleScalar: { input: any; output: any };
      }

      /** Greetings Enum */
      export enum GreetingsEnum {
        /** @deprecated Field no longer supported */
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
        language: Scalars['String']['input'];
        scal?: InputMaybe<Scalars['ExampleScalar']['input']>;
        value?: InputMaybe<Scalars['String']['input']>;
      }

      export enum OtherEnum {
        Other = 'Other',
      }

      export const scalarsEnumsHash: ScalarsEnumsHash = {
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
            __args: { hello: 'String!', helloThree: 'String!', helloTwo: 'String' },
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
        fieldWithArgs: (args: { id: ScalarsEnums['Int'] }) => ScalarsEnums['Int'];
        name: ScalarsEnums['String'];
        other?: Maybe<ScalarsEnums['String']>;
        withArgs: (args: {
          a: ScalarsEnums['Int'];
          b?: Maybe<ScalarsEnums['Int']>;
        }) => Maybe<ScalarsEnums['Int']>;
        withArgs2: (args?: { a?: Maybe<ScalarsEnums['Int']> }) => ScalarsEnums['Int'];
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
          a: ScalarsEnums['Int'];
          b?: Maybe<ScalarsEnums['Int']>;
        }) => Maybe<ScalarsEnums['Int']>;
        withArgs2: (args?: { a?: Maybe<ScalarsEnums['Int']> }) => ScalarsEnums['Int'];
      }

      export interface Mutation {
        __typename?: 'Mutation';
        increment: (args: { n: ScalarsEnums['Int'] }) => ScalarsEnums['Int'];
      }

      export interface Query {
        __typename?: 'Query';
        arrayObjectArgs: (args?: {
          /**
           * @defaultValue \`10\`
           */
          limit?: Maybe<ScalarsEnums['Int']>;
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
          who: ScalarsEnums['String'];
        }) => Human;
        simpleString: ScalarsEnums['String'];
        stringNullableWithArgs: (args: {
          hello: ScalarsEnums['String'];
          /**
           * @defaultValue \`"Hi"\`
           */
          helloThree?: Maybe<ScalarsEnums['String']>;
          /**
           * @defaultValue \`"Hi"\`
           */
          helloTwo?: Maybe<ScalarsEnums['String']>;
        }) => Maybe<ScalarsEnums['String']>;
        stringNullableWithArgsArray: (args: {
          hello: Array<Maybe<ScalarsEnums['String']>>;
        }) => Maybe<ScalarsEnums['String']>;
        stringWithArgs: (args: {
          hello: ScalarsEnums['String'];
        }) => ScalarsEnums['String'];
      }

      export interface Subscription {
        __typename?: 'Subscription';
      }

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

      export type ScalarsEnums = {
        [Key in keyof Scalars]: Scalars[Key] extends { output: unknown }
          ? Scalars[Key]['output']
          : never;
      } & {
        GreetingsEnum: GreetingsEnum;
        OtherEnum: OtherEnum;
      };
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
              "helloThree": "String!",
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
  ).resolves.toBe(`Unexpected keyword or identifier. (7:9)`);
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
       * GQty AUTO-GENERATED CODE: PLEASE DO NOT MODIFY MANUALLY
       */

      import { type ScalarsEnumsHash } from 'gqty';

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
      export type MakeEmpty<
        T extends { [key: string]: unknown },
        K extends keyof T
      > = { [_ in K]?: never };
      export type Incremental<T> =
        | T
        | {
            [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
          };
      /** All built-in and custom scalars, mapped to their actual values */
      export interface Scalars {
        ID: { input: string; output: string };
        String: { input: string; output: string };
        Boolean: { input: boolean; output: boolean };
        Int: { input: number; output: number };
        Float: { input: number; output: number };
      }

      export const scalarsEnumsHash: ScalarsEnumsHash = {
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
        helloMutation: (args: {
          hello: ScalarsEnums['String'];
        }) => ScalarsEnums['String'];
      }

      export interface Query {
        __typename?: 'Query';
        hello: ScalarsEnums['String'];
      }

      export interface Subscription {
        __typename?: 'Subscription';
      }

      export interface GeneratedSchema {
        query: Query;
        mutation: Mutation;
        subscription: Subscription;
      }

      export type ScalarsEnums = {
        [Key in keyof Scalars]: Scalars[Key] extends { output: unknown }
          ? Scalars[Key]['output']
          : never;
      } & {};
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
       * GQty AUTO-GENERATED CODE: PLEASE DO NOT MODIFY MANUALLY
       */

      import { type ScalarsEnumsHash } from 'gqty';

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
      export type MakeEmpty<
        T extends { [key: string]: unknown },
        K extends keyof T
      > = { [_ in K]?: never };
      export type Incremental<T> =
        | T
        | {
            [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
          };
      /** All built-in and custom scalars, mapped to their actual values */
      export interface Scalars {
        ID: { input: string; output: string };
        String: { input: string; output: string };
        Boolean: { input: boolean; output: boolean };
        Int: { input: number; output: number };
        Float: { input: number; output: number };
      }

      export const scalarsEnumsHash: ScalarsEnumsHash = {
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

      export interface GeneratedSchema {
        query: Query;
        mutation: Mutation;
        subscription: Subscription;
      }

      export type ScalarsEnums = {
        [Key in keyof Scalars]: Scalars[Key] extends { output: unknown }
          ? Scalars[Key]['output']
          : never;
      } & {};
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
     * GQty: You can safely modify this file based on your needs.
     */

    import { createReactClient } from '@gqty/react';
    import { createSolidClient } from '@gqty/solid';
    import { createClient as createSubscriptionsClient } from 'graphql-ws';
    import { Cache, createClient, defaultResponseHandler } from 'gqty';
    import { generatedSchema, scalarsEnumsHash } from './schema.generated';

    /**
     * @type {import("gqty").QueryFetcher}
     */
    const queryFetcher = async function (
      { query, variables, operationName },
      fetchOptions
    ) {
      // Modify "/api/graphql" if needed
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables,
          operationName,
        }),
        mode: 'cors',
        ...fetchOptions,
      });

      return await defaultResponseHandler(response);
    };

    const subscriptionsClient =
      typeof window !== 'undefined'
        ? createSubscriptionsClient({
            lazy: true,
            url: () => {
              // Modify if needed
              const url = new URL('/api/graphql', window.location.href);
              url.protocol = url.protocol.replace('http', 'ws');
              return url.href;
            },
          })
        : undefined;

    const cache = new Cache(
      undefined,
      /**
       * Default option is immediate cache expiry but keep it for 5 minutes,
       * allowing soft refetches in background.
       */
      {
        maxAge: 0,
        staleWhileRevalidate: 5 * 60 * 1000,
        normalization: true,
      }
    );

    /**
     * @type {import("gqty").GQtyClient<import("./schema.generated").GeneratedSchema>}
     */
    export const client = createClient({
      schema: generatedSchema,
      scalars: scalarsEnumsHash,
      cache,
      fetchOptions: {
        fetcher: queryFetcher,
        subscriber: subscriptionsClient,
      },
    });

    // Core functions
    export const { resolve, subscribe, schema } = client;

    // Legacy functions
    export const {
      query,
      mutation,
      mutate,
      subscription,
      resolved,
      refetch,
      track,
    } = client;

    export const {
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
    } =
      /**
       * @type {import("@gqty/react").ReactClient<import("./schema.generated").GeneratedSchema>}
       */
      createReactClient(client, {
        defaults: {
          // Enable Suspense, you can override this option for each hook.
          suspense: true,
        },
      });

    export const { createQuery } = createSolidClient(client);

    export * from './schema.generated';
    "
  `);

  expect(javascriptSchemaCode).toMatchInlineSnapshot(`
    "/**
     * GQty AUTO-GENERATED CODE: PLEASE DO NOT MODIFY MANUALLY
     */

    import { SchemaUnionsKey } from 'gqty';

    /**
     * @type {import("gqty").ScalarsEnumsHash}
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
     * GQty AUTO-GENERATED CODE: PLEASE DO NOT MODIFY MANUALLY
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
    export type MakeEmpty<
      T extends { [key: string]: unknown },
      K extends keyof T
    > = { [_ in K]?: never };
    export type Incremental<T> =
      | T
      | {
          [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
        };
    /** All built-in and custom scalars, mapped to their actual values */
    export interface Scalars {
      ID: { input: string; output: string };
      String: { input: string; output: string };
      Boolean: { input: boolean; output: boolean };
      Int: { input: number; output: number };
      Float: { input: number; output: number };
    }

    export declare const scalarsEnumsHash: ScalarsEnumsHash;
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

    export interface $C {
      A?: A;
      B?: B;
    }

    export interface GeneratedSchema {
      query: Query;
      mutation: Mutation;
      subscription: Subscription;
    }

    export type ScalarsEnums = {
      [Key in keyof Scalars]: Scalars[Key] extends { output: unknown }
        ? Scalars[Key]['output']
        : never;
    } & {};
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
     * GQty: You can safely modify this file based on your needs.
     */

    import { createReactClient } from '@gqty/react';
    import { createSolidClient } from '@gqty/solid';
    import {
      Cache,
      createClient,
      defaultResponseHandler,
      type QueryFetcher,
    } from 'gqty';
    import {
      generatedSchema,
      scalarsEnumsHash,
      type GeneratedSchema,
    } from './schema.generated';

    const queryFetcher: QueryFetcher = async function (
      { query, variables, operationName },
      fetchOptions
    ) {
      // Modify "/api/graphql" if needed
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables,
          operationName,
        }),
        mode: 'cors',
        ...fetchOptions,
      });

      return await defaultResponseHandler(response);
    };

    const cache = new Cache(
      undefined,
      /**
       * Default option is immediate cache expiry but keep it for 5 minutes,
       * allowing soft refetches in background.
       */
      {
        maxAge: 0,
        staleWhileRevalidate: 5 * 60 * 1000,
        normalization: true,
      }
    );

    export const client = createClient<GeneratedSchema>({
      schema: generatedSchema,
      scalars: scalarsEnumsHash,
      cache,
      fetchOptions: {
        fetcher: queryFetcher,
      },
    });

    // Core functions
    export const { resolve, subscribe, schema } = client;

    // Legacy functions
    export const {
      query,
      mutation,
      mutate,
      subscription,
      resolved,
      refetch,
      track,
    } = client;

    export const {
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
        // Enable Suspense, you can override this option for each hook.
        suspense: true,
      },
    });

    export const { createQuery } = createSolidClient(client);

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
     * GQty AUTO-GENERATED CODE: PLEASE DO NOT MODIFY MANUALLY
     */

    /**
     * @type {import("gqty").ScalarsEnumsHash}
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
     * GQty AUTO-GENERATED CODE: PLEASE DO NOT MODIFY MANUALLY
     */

    import { type ScalarsEnumsHash } from 'gqty';

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
    export type MakeEmpty<
      T extends { [key: string]: unknown },
      K extends keyof T
    > = { [_ in K]?: never };
    export type Incremental<T> =
      | T
      | {
          [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
        };
    /** All built-in and custom scalars, mapped to their actual values */
    export interface Scalars {
      ID: { input: string; output: string };
      String: { input: string; output: string };
      Boolean: { input: boolean; output: boolean };
      Int: { input: number; output: number };
      Float: { input: number; output: number };
    }

    export const scalarsEnumsHash: ScalarsEnumsHash = {
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
        optional?: Maybe<ScalarsEnums['String']>;
        required: ScalarsEnums['Int'];
      }) => Maybe<ScalarsEnums['Int']>;
    }

    export interface Subscription {
      __typename?: 'Subscription';
    }

    export interface GeneratedSchema {
      query: Query;
      mutation: Mutation;
      subscription: Subscription;
    }

    export type ScalarsEnums = {
      [Key in keyof Scalars]: Scalars[Key] extends { output: unknown }
        ? Scalars[Key]['output']
        : never;
    } & {};
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

test('transformSchema removes fields', async () => {
  const { getEnveloped } = await createTestApp({
    schema: {
      typeDefs: gql`
        type Query {
          hello: String!
          a: A
        }
        type A {
          name: String!
        }
      `,
    },
  });

  const originalSchema = (await generate(getEnveloped().schema))
    .generatedSchema;

  const transformedSchema = (
    await generate(getEnveloped().schema, {
      transformSchema(schema, { GraphQLSchema }) {
        const config = schema.toConfig();

        config.types = config.types.filter((type) => {
          switch (type.name) {
            case 'A':
              return false;
            default:
              return true;
          }
        });

        delete config.query!.getFields()['a'];

        return new GraphQLSchema(config);
      },
    })
  ).generatedSchema;

  expect(originalSchema).toMatchInlineSnapshot(`
    {
      "A": {
        "__typename": {
          "__type": "String!",
        },
        "name": {
          "__type": "String!",
        },
      },
      "mutation": {},
      "query": {
        "__typename": {
          "__type": "String!",
        },
        "a": {
          "__type": "A",
        },
        "hello": {
          "__type": "String!",
        },
      },
      "subscription": {},
    }
  `);

  expect(transformedSchema).toMatchInlineSnapshot(`
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
      "subscription": {},
    }
  `);

  expect(originalSchema).not.toEqual(transformedSchema);

  expect(originalSchema.query.a).toBeDefined();
  expect(originalSchema.A).toBeDefined();

  expect(transformedSchema.query.a).toBeUndefined();
  expect(transformedSchema.a).toBeUndefined();
});

test('invalid transformSchema', async () => {
  const { getEnveloped } = await createTestApp({
    schema: {
      typeDefs: gql`
        type Query {
          hello: String!
        }
      `,
    },
  });

  try {
    await generate(getEnveloped().schema, {
      transformSchema() {
        return null as any;
      },
    });
    throw Error("Shouldn't reach this");
  } catch (err) {
    assert(err instanceof Error);
    expect(err.message).toBe(
      `"transformSchema" returned an invalid GraphQL Schema!`
    );
  }
});

test('fields with default value works', async () => {
  const { getEnveloped } = await createTestApp({
    schema: {
      typeDefs: gql`
        "Query"
        type Query {
          hello(world: String! = "world"): String!
        }
      `,
    },
  });

  const shouldBeIncluded = '// This should be included';

  const { schemaCode } = await generate(getEnveloped().schema, {
    preImport: `
        ${shouldBeIncluded}
        `,
    react: true,
    subscriptions: true,
  });

  expect(schemaCode).toMatchInlineSnapshot(`
    "/**
     * GQty AUTO-GENERATED CODE: PLEASE DO NOT MODIFY MANUALLY
     */

    // This should be included

    import { type ScalarsEnumsHash } from 'gqty';

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
    export type MakeEmpty<
      T extends { [key: string]: unknown },
      K extends keyof T
    > = { [_ in K]?: never };
    export type Incremental<T> =
      | T
      | {
          [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
        };
    /** All built-in and custom scalars, mapped to their actual values */
    export interface Scalars {
      ID: { input: string; output: string };
      String: { input: string; output: string };
      Boolean: { input: boolean; output: boolean };
      Int: { input: number; output: number };
      Float: { input: number; output: number };
    }

    export const scalarsEnumsHash: ScalarsEnumsHash = {
      Boolean: true,
      String: true,
    };
    export const generatedSchema = {
      mutation: {},
      query: {
        __typename: { __type: 'String!' },
        hello: { __type: 'String!', __args: { world: 'String!' } },
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
      hello: (args: {
        /**
         * @defaultValue \`"world"\`
         */
        world?: Maybe<ScalarsEnums['String']>;
      }) => ScalarsEnums['String'];
    }

    export interface Subscription {
      __typename?: 'Subscription';
    }

    export interface GeneratedSchema {
      query: Query;
      mutation: Mutation;
      subscription: Subscription;
    }

    export type ScalarsEnums = {
      [Key in keyof Scalars]: Scalars[Key] extends { output: unknown }
        ? Scalars[Key]['output']
        : never;
    } & {};
    "
  `);

  expect(schemaCode.split('\n')[4]).toStrictEqual(shouldBeIncluded);
});
