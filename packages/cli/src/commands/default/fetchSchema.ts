import type { AsyncExecutor } from '@graphql-tools/utils';
import type { ExecutionResult, GraphQLSchema } from 'graphql';
import { readFile } from 'node:fs/promises';
import { extname } from 'path';
import type { GQtyConfig } from '../../config';
import * as deps from '../../deps';
import { convertHeadersInput } from './convertHeadersInput';
import { logger } from './logger';

const schemaFileExtensions = ['.gql', '.graphql'];

export class FetchError extends Error {
  readonly name = 'FetchError';

  constructor(
    readonly request: RequestInit,
    readonly response: Response
  ) {
    super(
      `Received status code ${response.status} when introspecting ${response.url}`
    );
  }
}

export type FetchSchemasOptions = {
  headers?: Record<string, string>;
  headersByEndpoint?: GQtyConfig['introspections'];
  silent?: boolean;
};

export function fetchSchema(
  endpoint: string,
  options?: FetchSchemasOptions
): Promise<GraphQLSchema>;
export function fetchSchema(
  endpoint: string[],
  options?: FetchSchemasOptions
): Promise<GraphQLSchema>;
export async function fetchSchema(
  endpoints: string[] | string,
  options: FetchSchemasOptions = {}
): Promise<GraphQLSchema> {
  const schemas: string[] = [];

  if (!options.headersByEndpoint) {
    options.headersByEndpoint = {};
  }

  if (!Array.isArray(endpoints)) {
    endpoints = [endpoints];
  }

  for (const endpoint of endpoints) {
    const { headers, headersByEndpoint } = options;

    const doFetchSchema = async () => {
      const schema = await doIntrospection(endpoint, {
        headers: headers ?? headersByEndpoint[endpoint]?.headers,
        silent: options.silent,
      });

      if (schema === undefined) return;

      schemas.push(schema);
    };

    try {
      await doFetchSchema();
    } catch (e) {
      if (
        e instanceof FetchError &&
        e.response.status === 401 &&
        headers === undefined &&
        headersByEndpoint[endpoint]?.headers === undefined
      ) {
        process.stdout.write('\r');

        const inHeaders = await promptHeaders();

        // If still no headers provided, throw.
        if (inHeaders === undefined) {
          throw e;
        }

        headersByEndpoint[e.response.url] = { headers: inHeaders };

        await doFetchSchema();
      } else {
        throw e;
      }
    }
  }

  if (schemas.length === 0) {
    throw new Error('No schemas found.');
  }

  if (!options.silent) {
    logger.successProgress('Schema introspection completed.');
    console.log('');
  }

  return deps.buildSchema(schemas.join('\n'));
}

const doIntrospection = async (
  endpoint: string,
  options?: Pick<RequestInit, 'headers'> & { silent?: boolean }
): Promise<string | undefined> => {
  if (isURL(endpoint)) {
    if (!options?.silent) {
      logger.infoProgress(
        `Fetching schema from remote endpoint '${endpoint}'...`
      );
    }

    const executor: AsyncExecutor<ExecutionResult> = async ({
      document,
      variables,
      extensions = {},
    }) => {
      const { print } = await import('graphql');
      const request: RequestInit = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        body: JSON.stringify({
          query: print(document),
          variables,
          extensions: {
            ...extensions,
            endpoint,
          },
        }),
      };
      const response = await deps.fetch(endpoint, request);

      if (response.status >= 400) {
        throw new FetchError(request, response);
      }

      const body = await response.text();

      try {
        return JSON.parse(body);
      } catch {
        throw new SyntaxError(
          `Invalid JSON received from ${endpoint}: "${
            body.length > 50
              ? body.slice(0, 50).replace(/\n/g, '') + '...'
              : body
          }".`
        );
      }
    };

    const schema = await deps.schemaFromExecutor(executor);

    return deps.printSchema(schema);
  } else {
    const files = await deps
      .fg(endpoint)
      .then((files) =>
        files.filter((file) => schemaFileExtensions.includes(extname(file)))
      );

    if (files.length === 0) return;

    const fileContents: string[] = [];

    for (const file of files) {
      if (!options?.silent) {
        logger.infoProgress(`Reading schema file ${file} ...`);
      }

      fileContents.push(await readFile(file, { encoding: 'utf-8' }));
    }

    return fileContents.join('\n');
  }
};

const promptHeaders = async () => {
  if (!process.stdin.isTTY) return;

  const headers = await deps.inquirer.input({
    message: `Any request headers? (Authorization: Bearer <token>, X-Foo: <bar>)`,
  });

  return convertHeadersInput(headers.split(/,/));
};

export const isURL = (input: string) => /^https?:\/\//.test(input);
