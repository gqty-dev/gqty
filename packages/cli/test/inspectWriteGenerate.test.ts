import fs from 'fs';
import path from 'path';
import {
  createTestApp,
  gql,
  type BuildContextArgs,
  type GetEnvelopedFn,
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
       * GQty: You can safely modify this file based on your needs.
       */

      import { createReactClient } from '@gqty/react';
      import { Cache, GQtyError, createClient, type QueryFetcher } from 'gqty';
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

        if (response.status >= 400) {
          throw new GQtyError(
            \`GraphQL endpoint responded with HTTP status \${response.status}.\`
          );
        }

        const text = await response.text();

        try {
          return JSON.parse(text);
        } catch {
          throw new GQtyError(
            \`Malformed JSON response: \${
              text.length > 50 ? text.slice(0, 50) + '...' : text
            }\`
          );
        }
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

      export * from './schema.generated';
      "
    `);

    expect(
      await readFile(tempDir.schemaPath, {
        encoding: 'utf-8',
      })
    ).toMatchInlineSnapshot(`
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
        subscription: {},
      } as const;

      export interface Mutation {
        __typename?: 'Mutation';
      }

      export interface Query {
        __typename?: 'Query';
        hello: Scalars['String']['output'];
      }

      export interface Subscription {
        __typename?: 'Subscription';
      }

      export interface GeneratedSchema {
        query: Query;
        mutation: Mutation;
        subscription: Subscription;
      }

      type Enums = {};

      export type InputFields = {
        [Key in keyof Scalars]: Scalars[Key] extends { input: unknown }
          ? Scalars[Key]['input']
          : never;
      } & Enums;

      export type OutputFields = {
        [Key in keyof Scalars]: Scalars[Key] extends { output: unknown }
          ? Scalars[Key]['output']
          : never;
      } & Enums;
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
         * GQty: You can safely modify this file based on your needs.
         */

        import { createReactClient } from '@gqty/react';
        import { Cache, GQtyError, createClient, type QueryFetcher } from 'gqty';
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

          if (response.status >= 400) {
            throw new GQtyError(
              \`GraphQL endpoint responded with HTTP status \${response.status}.\`
            );
          }

          const text = await response.text();

          try {
            return JSON.parse(text);
          } catch {
            throw new GQtyError(
              \`Malformed JSON response: \${
                text.length > 50 ? text.slice(0, 50) + '...' : text
              }\`
            );
          }
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

        export * from './schema.generated';
        "
      `);

      expect(generatedFileContentSchema).toMatchInlineSnapshot(`
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
          query: { __typename: { __type: 'String!' }, hello: { __type: 'Int!' } },
          subscription: {},
        } as const;

        export interface Mutation {
          __typename?: 'Mutation';
        }

        export interface Query {
          __typename?: 'Query';
          hello: Scalars['Int']['output'];
        }

        export interface Subscription {
          __typename?: 'Subscription';
        }

        export interface GeneratedSchema {
          query: Query;
          mutation: Mutation;
          subscription: Subscription;
        }

        type Enums = {};

        export type InputFields = {
          [Key in keyof Scalars]: Scalars[Key] extends { input: unknown }
            ? Scalars[Key]['input']
            : never;
        } & Enums;

        export type OutputFields = {
          [Key in keyof Scalars]: Scalars[Key] extends { output: unknown }
            ? Scalars[Key]['output']
            : never;
        } & Enums;
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
         * GQty: You can safely modify this file based on your needs.
         */

        import { createReactClient } from '@gqty/react';
        import { Cache, GQtyError, createClient, type QueryFetcher } from 'gqty';
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

          if (response.status >= 400) {
            throw new GQtyError(
              \`GraphQL endpoint responded with HTTP status \${response.status}.\`
            );
          }

          const text = await response.text();

          try {
            return JSON.parse(text);
          } catch {
            throw new GQtyError(
              \`Malformed JSON response: \${
                text.length > 50 ? text.slice(0, 50) + '...' : text
              }\`
            );
          }
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

        export * from './schema.generated';
        "
      `);

      expect(generatedFileContentSchema).toMatchInlineSnapshot(`
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
          subscription: {},
        } as const;

        export interface Mutation {
          __typename?: 'Mutation';
        }

        export interface Query {
          __typename?: 'Query';
          hello: Scalars['String']['output'];
        }

        export interface Subscription {
          __typename?: 'Subscription';
        }

        export interface GeneratedSchema {
          query: Query;
          mutation: Mutation;
          subscription: Subscription;
        }

        type Enums = {};

        export type InputFields = {
          [Key in keyof Scalars]: Scalars[Key] extends { input: unknown }
            ? Scalars[Key]['input']
            : never;
        } & Enums;

        export type OutputFields = {
          [Key in keyof Scalars]: Scalars[Key] extends { output: unknown }
            ? Scalars[Key]['output']
            : never;
        } & Enums;
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
         * GQty: You can safely modify this file based on your needs.
         */

        import { createReactClient } from '@gqty/react';
        import { Cache, GQtyError, createClient, type QueryFetcher } from 'gqty';
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

          if (response.status >= 400) {
            throw new GQtyError(
              \`GraphQL endpoint responded with HTTP status \${response.status}.\`
            );
          }

          const text = await response.text();

          try {
            return JSON.parse(text);
          } catch {
            throw new GQtyError(
              \`Malformed JSON response: \${
                text.length > 50 ? text.slice(0, 50) + '...' : text
              }\`
            );
          }
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

        export * from './schema.generated';
        "
      `);

      expect(generatedFileContentSchema).toMatchInlineSnapshot(`
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
          subscription: {},
        } as const;

        export interface Mutation {
          __typename?: 'Mutation';
        }

        export interface Query {
          __typename?: 'Query';
          hello: Scalars['String']['output'];
        }

        export interface Subscription {
          __typename?: 'Subscription';
        }

        export interface GeneratedSchema {
          query: Query;
          mutation: Mutation;
          subscription: Subscription;
        }

        type Enums = {};

        export type InputFields = {
          [Key in keyof Scalars]: Scalars[Key] extends { input: unknown }
            ? Scalars[Key]['input']
            : never;
        } & Enums;

        export type OutputFields = {
          [Key in keyof Scalars]: Scalars[Key] extends { output: unknown }
            ? Scalars[Key]['output']
            : never;
        } & Enums;
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
         * GQty: You can safely modify this file based on your needs.
         */

        import { createReactClient } from '@gqty/react';
        import { Cache, GQtyError, createClient, type QueryFetcher } from 'gqty';
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

          if (response.status >= 400) {
            throw new GQtyError(
              \`GraphQL endpoint responded with HTTP status \${response.status}.\`
            );
          }

          const text = await response.text();

          try {
            return JSON.parse(text);
          } catch {
            throw new GQtyError(
              \`Malformed JSON response: \${
                text.length > 50 ? text.slice(0, 50) + '...' : text
              }\`
            );
          }
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

        export * from './schema.generated';
        "
      `);

      expect(generatedFileContentSchema).toMatchInlineSnapshot(`
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
          bar: Scalars['Int']['output'];
          foo: Scalars['Int']['output'];
        }

        export interface Subscription {
          __typename?: 'Subscription';
        }

        export interface GeneratedSchema {
          query: Query;
          mutation: Mutation;
          subscription: Subscription;
        }

        type Enums = {};

        export type InputFields = {
          [Key in keyof Scalars]: Scalars[Key] extends { input: unknown }
            ? Scalars[Key]['input']
            : never;
        } & Enums;

        export type OutputFields = {
          [Key in keyof Scalars]: Scalars[Key] extends { output: unknown }
            ? Scalars[Key]['output']
            : never;
        } & Enums;
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
       * GQty: You can safely modify this file based on your needs.
       */

      import { createReactClient } from '@gqty/react';
      import { Cache, GQtyError, createClient, type QueryFetcher } from 'gqty';
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

        if (response.status >= 400) {
          throw new GQtyError(
            \`GraphQL endpoint responded with HTTP status \${response.status}.\`
          );
        }

        const text = await response.text();

        try {
          return JSON.parse(text);
        } catch {
          throw new GQtyError(
            \`Malformed JSON response: \${
              text.length > 50 ? text.slice(0, 50) + '...' : text
            }\`
          );
        }
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

      export * from './schema.generated';
      "
    `);

    expect(generatedFileContentSchema).toMatchInlineSnapshot(`
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
        query: { __typename: { __type: 'String!' }, hello: { __type: 'String!' } },
        subscription: {},
      } as const;

      export interface Mutation {
        __typename?: 'Mutation';
      }

      export interface Query {
        __typename?: 'Query';
        hello: Scalars['String']['output'];
      }

      export interface Subscription {
        __typename?: 'Subscription';
      }

      export interface GeneratedSchema {
        query: Query;
        mutation: Mutation;
        subscription: Subscription;
      }

      type Enums = {};

      export type InputFields = {
        [Key in keyof Scalars]: Scalars[Key] extends { input: unknown }
          ? Scalars[Key]['input']
          : never;
      } & Enums;

      export type OutputFields = {
        [Key in keyof Scalars]: Scalars[Key] extends { output: unknown }
          ? Scalars[Key]['output']
          : never;
      } & Enums;
      "
    `);

    expect(generatedFileContentSchema.split('\n')[4]).toStrictEqual(
      shouldBeIncluded
    );
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
          query: { __typename: { __type: 'String!' }, hello: { __type: 'String!' } },
          subscription: {},
        } as const;

        export interface Mutation {
          __typename?: 'Mutation';
        }

        export interface Query {
          __typename?: 'Query';
          hello: Scalars['String']['output'];
        }

        export interface Subscription {
          __typename?: 'Subscription';
        }

        export interface GeneratedSchema {
          query: Query;
          mutation: Mutation;
          subscription: Subscription;
        }

        type Enums = {};

        export type InputFields = {
          [Key in keyof Scalars]: Scalars[Key] extends { input: unknown }
            ? Scalars[Key]['input']
            : never;
        } & Enums;

        export type OutputFields = {
          [Key in keyof Scalars]: Scalars[Key] extends { output: unknown }
            ? Scalars[Key]['output']
            : never;
        } & Enums;
        "
      `);

      expect(
        generatedFileContent
          .split('\n')
          .slice(4)
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
        `\n"Could not obtain introspection result, received the following as response; \n { statusCode: 500, error: "Internal Server Error", message: "Unauthorized!" }"\n`
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
         * GQty: You can safely modify this file based on your needs.
         */

        import { createReactClient } from '@gqty/react';
        import { Cache, GQtyError, createClient, type QueryFetcher } from 'gqty';
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

          if (response.status >= 400) {
            throw new GQtyError(
              \`GraphQL endpoint responded with HTTP status \${response.status}.\`
            );
          }

          const text = await response.text();

          try {
            return JSON.parse(text);
          } catch {
            throw new GQtyError(
              \`Malformed JSON response: \${
                text.length > 50 ? text.slice(0, 50) + '...' : text
              }\`
            );
          }
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

        export * from './schema.generated';
        "
      `);

      expect(await readFile(tempDir.schemaPath, { encoding: 'utf-8' }))
        .toMatchInlineSnapshot(`
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
          subscription: {},
        } as const;

        export interface Mutation {
          __typename?: 'Mutation';
        }

        export interface Query {
          __typename?: 'Query';
          hello: Scalars['String']['output'];
        }

        export interface Subscription {
          __typename?: 'Subscription';
        }

        export interface GeneratedSchema {
          query: Query;
          mutation: Mutation;
          subscription: Subscription;
        }

        type Enums = {};

        export type InputFields = {
          [Key in keyof Scalars]: Scalars[Key] extends { input: unknown }
            ? Scalars[Key]['input']
            : never;
        } & Enums;

        export type OutputFields = {
          [Key in keyof Scalars]: Scalars[Key] extends { output: unknown }
            ? Scalars[Key]['output']
            : never;
        } & Enums;
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
    if (/^\[Warning\]/.test(message)) {
      switch (++n) {
        case 1: {
          expect(message.replace(clientPathRegex, 'client.ts'))
            .toMatchInlineSnapshot(`
            "[Warning] You've changed the option "subscriptions" to 'true', which is different from your existing "client.ts".
            If you meant to change this, please remove "client.ts" and re-run code generation."
          `);
          break;
        }
        case 2: {
          expect(message.replace(clientPathRegex, 'client.ts'))
            .toMatchInlineSnapshot(`
            "[Warning] You've changed the option "react" to 'true', which is different from your existing "client.ts".
            If you meant to change this, please remove "client.ts" and re-run code generation."
          `);
          break;
        }
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
