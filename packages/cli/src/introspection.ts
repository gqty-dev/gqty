import type { AsyncExecutor } from '@graphql-tools/utils';
import type { GraphQLSchema } from 'graphql';
import { print } from 'graphql';
import { defaultConfig, gqtyConfigPromise } from './config';
import * as deps from './deps.js';

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
    const fetchResult = await deps.nodeFetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({ query, variables }),
    });
    return fetchResult.json() as any;
  };

  const schema = deps.wrapSchema({
    schema: await deps.introspectSchema(executor, {
      endpoint,
    }),
    executor,
  });

  return schema;
};
