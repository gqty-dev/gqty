import fs from 'fs';
import path from 'path';
import {
  BuildContextArgs,
  createTestApp,
  GetEnvelopedFn,
  gql,
} from 'test-utils';
import tmp from 'tmp-promise';
import { inspectWriteGenerate } from '../src/inspectWriteGenerate';
import { getTempDir } from './utils';

const { readFile } = fs.promises;
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
let getEnveloped: GetEnvelopedFn<unknown>;
beforeAll(async () => {
  const testApp = await testAppPromise;

  getEnveloped = testApp.getEnveloped;

  endpoint = testApp.endpoint;
});

test('basic inspectWriteGenerate functionality', async () => {
  const tempDir = await getTempDir();

  try {
    await inspectWriteGenerate({
      endpoint,
      destination: tempDir.clientPath,
    });

    expect(
      (
        await readFile(tempDir.clientPath, {
          encoding: 'utf-8',
        })
      ).replace(new RegExp(endpoint, 'g'), '/graphql')
    ).toMatchInlineSnapshot(`
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

    expect(
      await readFile(tempDir.schemaPath, {
        encoding: 'utf-8',
      })
    ).toMatchInlineSnapshot(`
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
        subscription: {},
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
  } finally {
    await tempDir.cleanup();
  }
});

describe('from file', () => {
  test('generate from graphql schema file', async () => {
    const tempFile = await tmp.file({
      postfix: '.gql',
    });
    const tempDir = await getTempDir();

    try {
      await fs.promises.writeFile(
        tempFile.path,
        `
      type Query {
        hello: Int!
      }
      `
      );

      await inspectWriteGenerate({
        endpoint: tempFile.path,
        destination: tempDir.clientPath,
      });

      const generatedFileContentClient = await readFile(tempDir.clientPath, {
        encoding: 'utf-8',
      });

      const generatedFileContentSchema = await readFile(tempDir.schemaPath, {
        encoding: 'utf-8',
      });

      expect(
        generatedFileContentClient.replace(
          new RegExp(endpoint, 'g'),
          '/graphql'
        )
      ).toMatchInlineSnapshot(`
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
      expect(generatedFileContentSchema).toMatchInlineSnapshot(`
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
          query: { __typename: { __type: 'String!' }, hello: { __type: 'Int!' } },
          subscription: {},
        } as const;

        export interface Mutation {
          __typename?: 'Mutation';
        }

        export interface Query {
          __typename?: 'Query';
          hello: ScalarsEnums['Int'];
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
    } finally {
      await tempFile.cleanup();
      await tempDir.cleanup();
    }
  });

  test('generate from graphql JSON introspection schema file with data field', async () => {
    const { getIntrospectionQuery, graphqlSync } = await import('graphql');
    const tempFile = await tmp.file({
      postfix: '.json',
    });
    const tempDir = await getTempDir();

    try {
      await fs.promises.writeFile(
        tempFile.path,
        JSON.stringify(
          graphqlSync({
            schema: getEnveloped().schema,
            source: getIntrospectionQuery(),
          })
        )
      );

      await inspectWriteGenerate({
        endpoint: tempFile.path,
        destination: tempDir.clientPath,
      });

      const generatedFileContentClient = await readFile(tempDir.clientPath, {
        encoding: 'utf-8',
      });

      const generatedFileContentSchema = await readFile(tempDir.schemaPath, {
        encoding: 'utf-8',
      });

      expect(
        generatedFileContentClient.replace(
          new RegExp(endpoint, 'g'),
          '/graphql'
        )
      ).toMatchInlineSnapshot(`
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
      expect(generatedFileContentSchema).toMatchInlineSnapshot(`
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
          subscription: {},
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
    } finally {
      await tempFile.cleanup();
      await tempDir.cleanup();
    }
  });

  test('generate from graphql JSON introspection schema file', async () => {
    const { getIntrospectionQuery, graphqlSync } = await import('graphql');
    const tempFile = await tmp.file({
      postfix: '.json',
    });
    const tempDir = await getTempDir();

    try {
      await fs.promises.writeFile(
        tempFile.path,
        JSON.stringify(
          graphqlSync({
            schema: getEnveloped().schema,
            source: getIntrospectionQuery(),
          }).data
        )
      );

      await inspectWriteGenerate({
        endpoint: tempFile.path,
        destination: tempDir.clientPath,
      });

      const generatedFileContentClient = await readFile(tempDir.clientPath, {
        encoding: 'utf-8',
      });

      const generatedFileContentSchema = await readFile(tempDir.schemaPath, {
        encoding: 'utf-8',
      });

      expect(
        generatedFileContentClient.replace(
          new RegExp(endpoint, 'g'),
          '/graphql'
        )
      ).toMatchInlineSnapshot(`
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
      expect(generatedFileContentSchema).toMatchInlineSnapshot(`
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
          subscription: {},
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
    } finally {
      await tempFile.cleanup();
      await tempDir.cleanup();
    }
  });

  test('invalid json', async () => {
    const tempFile = await tmp.file({
      postfix: '.json',
    });
    const tempDir = await getTempDir();

    try {
      await fs.promises.writeFile(tempFile.path, JSON.stringify({}));

      await expect(async () => {
        await inspectWriteGenerate({
          endpoint: tempFile.path,
          destination: tempDir.clientPath,
        });
      }).rejects.toMatchInlineSnapshot(
        `[Error: Invalid JSON introspection result, expected "__schema" or "data.__schema" field.]`
      );
    } finally {
      await tempFile.cleanup();
      await tempDir.cleanup();
    }
  });

  test('non-existant file', async () => {
    const tempDir = await getTempDir();

    try {
      const endpoint = './non-existant-file.gql';
      const result = await inspectWriteGenerate({
        endpoint,
        destination: tempDir.clientPath,
      }).catch((err) => err);

      expect(result).toStrictEqual(
        Error(
          `File "${endpoint}" doesn't exists. If you meant to inspect a GraphQL API, make sure to put http:// or https:// in front of it.`
        )
      );
    } finally {
      tempDir.cleanup();
    }
  });
});

describe('from multiple files', () => {
  test('generate from graphql schema file', async () => {
    const tempFiles = await Promise.all([
      tmp.file({ postfix: '.gql' }),
      tmp.file({ postfix: '.gql' }),
    ]);
    const tempDir = await getTempDir();

    try {
      await fs.promises.writeFile(
        tempFiles[0].path,
        `type Query { foo: Int! }`
      );
      await fs.promises.writeFile(
        tempFiles[1].path,
        `extend type Query { bar: Int! }`
      );

      await inspectWriteGenerate({
        endpoint: `${path.dirname(tempFiles[0].path)}/*.gql`,
        destination: tempDir.clientPath,
      });

      const generatedFileContentClient = await readFile(tempDir.clientPath, {
        encoding: 'utf-8',
      });

      const generatedFileContentSchema = await readFile(tempDir.schemaPath, {
        encoding: 'utf-8',
      });

      expect(
        generatedFileContentClient.replace(
          new RegExp(endpoint, 'g'),
          '/graphql'
        )
      ).toMatchInlineSnapshot(`
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
            // Set this flag as \\"true\\" if your usage involves React Suspense
            // Keep in mind that you can overwrite it in a per-hook basis
            suspense: false,

            // Set this flag based on your needs
            staleWhileRevalidate: false,
          },
        });

        export * from './schema.generated';
        "
      `);
      expect(generatedFileContentSchema).toMatchInlineSnapshot(`
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
            bar: { __type: 'Int!' },
            foo: { __type: 'Int!' },
          },
          subscription: {},
        } as const;

        export interface Mutation {
          __typename?: 'Mutation';
        }

        export interface Query {
          __typename?: 'Query';
          bar: ScalarsEnums['Int'];
          foo: ScalarsEnums['Int'];
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
    } finally {
      await Promise.all(tempFiles.map((f) => f.cleanup()));
      await tempDir.cleanup();
    }
  });

  test('generate from multiple JSON files (should fail)', async () => {
    const tempFiles = await Promise.all([
      tmp.file({ postfix: '.json' }),
      tmp.file({ postfix: '.json' }),
    ]);
    const tempDir = await getTempDir();

    try {
      await expect(
        inspectWriteGenerate({
          endpoint: `${path.dirname(tempFiles[0].path)}/*.json`,
          destination: tempDir.clientPath,
        })
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"Received multiple JSON introspection files, shoud only be one"`
      );
    } finally {
      await Promise.all(tempFiles.map((f) => f.cleanup()));
      await tempDir.cleanup();
    }
  });

  test('generate from mixed input files (should fail)', async () => {
    const tempFiles = await Promise.all([
      tmp.file({ postfix: '.gql' }),
      tmp.file({ postfix: '.json' }),
    ]);
    const tempDir = await getTempDir();

    try {
      await expect(
        inspectWriteGenerate({
          endpoint: `${path.dirname(tempFiles[0].path)}/*.(gql|json)`,
          destination: tempDir.clientPath,
        })
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"Received mixed file inputs. Can not combine JSON and GQL files"`
      );
    } finally {
      await Promise.all(tempFiles.map((f) => f.cleanup()));
      await tempDir.cleanup();
    }
  });

  test('generate from unsupported file types (should fail)', async () => {
    const tempFiles = await Promise.all([tmp.file({ postfix: '.txt' })]);
    const tempDir = await getTempDir();

    try {
      await expect(
        inspectWriteGenerate({
          endpoint: `${path.dirname(tempFiles[0].path)}/*.txt`,
          destination: tempDir.clientPath,
        })
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"Received invalid files. Type generation can only use .gql, .graphql or .json files"`
      );
    } finally {
      await Promise.all(tempFiles.map((f) => f.cleanup()));
      await tempDir.cleanup();
    }
  });
});

test('specify generateOptions to inspectWriteGenerate', async () => {
  const tempDir = await getTempDir();

  const shouldBeIncluded = '// This should be included';

  try {
    await inspectWriteGenerate({
      endpoint,
      destination: tempDir.clientPath,
      generateOptions: {
        preImport: `
            ${shouldBeIncluded}
            `,
      },
    });

    const generatedFileContentClient = await readFile(tempDir.clientPath, {
      encoding: 'utf-8',
    });

    const generatedFileContentSchema = await readFile(tempDir.schemaPath, {
      encoding: 'utf-8',
    });

    expect(
      generatedFileContentClient.replace(new RegExp(endpoint, 'g'), '/graphql')
    ).toMatchInlineSnapshot(`
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
    expect(generatedFileContentSchema).toMatchInlineSnapshot(`
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
        String: true,
      };
      export const generatedSchema = {
        mutation: {},
        query: { __typename: { __type: 'String!' }, hello: { __type: 'String!' } },
        subscription: {},
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

    expect(
      generatedFileContentSchema
        .split('\n')
        .slice(3)
        .join('\n')
        .trim()
        .startsWith(shouldBeIncluded)
    ).toBeTruthy();
  } finally {
    await tempDir.cleanup();
  }
});

describe('inspect headers', () => {
  let endpoint: string;

  const secretToken = 'super secret token';

  const testAppPromise = createTestApp({
    schema: {
      typeDefs: `
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
    buildContext: ({ req }: BuildContextArgs) => {
      if (req.headers.authorization !== secretToken) {
        throw Error('Unauthorized!');
      }
      return {};
    },
  });

  beforeAll(async () => {
    const testApp = await testAppPromise;

    endpoint = testApp.endpoint;
  });

  test('specify headers to inspectWriteGenerate', async () => {
    const tempDir = await getTempDir();

    const shouldBeIncluded = '// This should be included';

    try {
      await inspectWriteGenerate({
        endpoint,
        destination: tempDir.clientPath,
        headers: {
          authorization: secretToken,
        },
        generateOptions: {
          preImport: shouldBeIncluded,
        },
      });

      const generatedFileContent = await readFile(tempDir.schemaPath, {
        encoding: 'utf-8',
      });

      expect(generatedFileContent).toMatchInlineSnapshot(`
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
          String: true,
        };
        export const generatedSchema = {
          mutation: {},
          query: { __typename: { __type: 'String!' }, hello: { __type: 'String!' } },
          subscription: {},
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

      expect(
        generatedFileContent
          .split('\n')
          .slice(3)
          .join('\n')
          .startsWith(shouldBeIncluded)
      ).toBeTruthy();
    } finally {
      await tempDir.cleanup();
    }
  });

  test('should throw if headers are not specified when required by server', async () => {
    const tempDir = await getTempDir({
      initClientFile: '',
    });

    try {
      await expect(
        inspectWriteGenerate({
          endpoint,
          destination: tempDir.clientPath,
        })
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"Could not obtain introspection result, received: {\\"statusCode\\":500,\\"error\\":\\"Internal Server Error\\",\\"message\\":\\"Unauthorized!\\"}"`
      );

      const generatedFileContent = await readFile(tempDir.clientPath, {
        encoding: 'utf-8',
      });

      expect(generatedFileContent).toBe('');
    } finally {
      await tempDir.cleanup();
    }
  });
});

describe('CLI behavior', () => {
  test('final message', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation();
    const tempDir = await getTempDir();

    try {
      await inspectWriteGenerate({
        endpoint,
        destination: tempDir.clientPath,
        cli: true,
      });

      expect(spy).toHaveBeenCalledTimes(1);

      expect(spy).toHaveBeenLastCalledWith(
        'Code generated successfully at ' + tempDir.clientPath
      );

      expect(
        (
          await readFile(tempDir.clientPath, {
            encoding: 'utf-8',
          })
        ).replace(new RegExp(endpoint, 'g'), '/graphql')
      ).toMatchInlineSnapshot(`
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

      expect(
        await readFile(tempDir.schemaPath, {
          encoding: 'utf-8',
        })
      ).toMatchInlineSnapshot(`
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
          subscription: {},
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
    } finally {
      await tempDir.cleanup();
      spy.mockRestore();
    }
  });
});

test('detect client config change between files', async () => {
  const tempDir = await getTempDir();

  const clientPathRegex = new RegExp(
    tempDir.clientPath.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'),
    'g'
  );

  let n = 0;
  const spy = jest.spyOn(console, 'warn').mockImplementation((message) => {
    switch (++n) {
      case 1: {
        expect(message.replace(clientPathRegex, 'client.ts'))
          .toMatchInlineSnapshot(`
          "[Warning] You've changed the option \\"subscriptions\\" to 'true', which is different from your existing \\"client.ts\\".
          If you meant to change this, please remove \\"client.ts\\" and re-run code generation."
        `);
        break;
      }
      case 2: {
        expect(message.replace(clientPathRegex, 'client.ts'))
          .toMatchInlineSnapshot(`
          "[Warning] You've changed the option \\"react\\" to 'true', which is different from your existing \\"client.ts\\".
          If you meant to change this, please remove \\"client.ts\\" and re-run code generation."
        `);
        break;
      }
    }
  });

  try {
    await inspectWriteGenerate({
      endpoint,
      destination: tempDir.clientPath,
      generateOptions: {
        react: false,
        subscriptions: false,
      },
    });

    expect(spy).toBeCalledTimes(0);

    await inspectWriteGenerate({
      endpoint,
      destination: tempDir.clientPath,
      generateOptions: {
        react: true,
        subscriptions: true,
      },
    });

    expect(spy).toBeCalledTimes(2);
  } finally {
    await tempDir.cleanup();
    spy.mockRestore();
  }
});
