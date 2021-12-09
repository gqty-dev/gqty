import { nodeFetch, introspectSchema, wrapSchema } from './deps.js';
import { print } from 'graphql';

import { gqtyConfigPromise, defaultConfig } from './config';

import type { AsyncExecutor } from '@graphql-tools/utils';

export interface IntrospectionOptions {
  /**
   * Endpoint of the remote GraphQL API or schema file
   */
  endpoint?: string;
  /**
   * Specify headers for the introspection
   */
  headers?: Record<string, string>;
}

import type { GraphQLSchema } from 'graphql';

export const getRemoteSchema = async (
  /**
   * Endpoint of the remote GraphQL API
   */
  endpoint: string,
  /**
   * Specify options for the introspection
   */
  { headers }: Pick<IntrospectionOptions, 'headers'> = {}
): Promise<GraphQLSchema> => {
  const executor: AsyncExecutor = async ({ document, variables }) => {
    headers ||=
      (await gqtyConfigPromise).config.introspection?.headers ||
      defaultConfig.introspection.headers;
    const query = print(document);
    const fetchResult = await nodeFetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({ query, variables }),
    });
    return fetchResult.json() as any;
  };

  const schema = wrapSchema({
    schema: await introspectSchema(executor, {
      endpoint,
    }),
    executor,
  });

  return schema;
};
