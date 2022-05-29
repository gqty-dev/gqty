import type {
  ExecutionResult,
  GraphQLSchema,
  IntrospectionQuery,
} from 'graphql';
import { defaultConfig, gqtyConfigPromise } from './config';

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
  const [{ request }, { buildClientSchema, getIntrospectionQuery }] =
    await Promise.all([import('undici'), import('graphql')]);

  headers ||=
    (await gqtyConfigPromise).config.introspection?.headers ||
    defaultConfig.introspection.headers;

  const query = getIntrospectionQuery({
    inputValueDeprecation: true,
    descriptions: true,
    schemaDescription: true,
    specifiedByUrl: true,
  });

  const { body } = await request(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({ query }),
  });

  const introspectionQuery: ExecutionResult<IntrospectionQuery> =
    await body.json();

  if (!introspectionQuery.data)
    throw Error('Unexpected error while introspecting schema');

  return buildClientSchema(introspectionQuery.data);
};
