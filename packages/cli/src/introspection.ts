import type { AsyncExecutor } from '@graphql-tools/utils';
import type { GraphQLSchema } from 'graphql';
import * as graphql from 'graphql';
import { defaultConfig, loadOrGenerateConfig } from './config';
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
      (await loadOrGenerateConfig()).config.introspection?.headers ||
      defaultConfig.introspection.headers;
    const query = graphql.print(document);
    const { request } = await import('undici');
    const { body } = await request(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({ query, variables }),
    });
    const response = await body.json();

    return response;
  };

  const schema = deps.wrapSchema({
    schema: await deps.schemaFromExecutor(executor, {
      endpoint,
    }),
    executor,
  });

  return schema;
};
