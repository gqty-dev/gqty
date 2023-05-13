import { type AsyncExecutor } from '@graphql-tools/utils';
import { GraphQLSchema, buildSchema, type ExecutionResult } from 'graphql';
import { readFile } from 'node:fs/promises';
import { extname } from 'path';
import { type GQtyConfig } from '../../config';
import * as deps from '../../deps';
import { convertHeadersInput } from './convertHeadersInput';
import { logger } from './logger';

const schemaFileExtensions = ['.gql', '.graphql'];

export class FetchError extends Error {
  readonly name = 'FetchError';

  constructor(readonly request: RequestInit, readonly response: Response) {
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

export const fetchSchemas = async (
  endpoints: string[],
  options: FetchSchemasOptions
) => {
  const schemas: GraphQLSchema[] = [];

  if (!options.headersByEndpoint) {
    options.headersByEndpoint = {};
  }

  for (const endpoint of endpoints) {
    const { headers, headersByEndpoint } = options;

    const doFetchSchema = async () => {
      const schema = await fetchSchema(endpoint, {
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

        const endpoint = e.response.url;
        const inHeaders = await promptHeaders(endpoint);

        // If still no headers provided, throw.
        if (inHeaders === undefined) {
          terminateWithError(e);
        }

        headersByEndpoint[endpoint] = { headers: inHeaders };

        try {
          await doFetchSchema();
        } catch (e) {
          terminateWithError(e);
        }
      } else {
        terminateWithError(e);
      }
    }
  }

  if (schemas.length === 0) {
    terminateWithError(new Error('No schemas found.'));
  }

  if (!options.silent) {
    logger.successProgress('Schema introspection completed.');
    console.log('');
  }

  return deps.mergeSchemas({ schemas });
};

const terminateWithError = (e: unknown) => {
  if (e instanceof Error) {
    logger.error(e.message);
    process.exit(1);
  }

  throw e;
};

const fetchSchema = async (
  endpoint: string,
  options?: Pick<RequestInit, 'headers'> & { silent?: boolean }
): Promise<GraphQLSchema | undefined> => {
  if (isURL(endpoint)) {
    if (!options?.silent) {
      logger.infoProgress(
        `Fetching schema from remote endpoint '${endpoint}'...`
      );
    }

    const executor: AsyncExecutor<ExecutionResult<any, any>> = async ({
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
        return JSON.parse(body) as ExecutionResult<any, any>;
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

    return await deps.schemaFromExecutor(executor);
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

    return buildSchema(fileContents.join('\n'));
  }
};

const promptHeaders = async (endpoint: string) => {
  if (!process.stdin.isTTY) return;

  const { headers } = await deps.inquirer.prompt<{ headers: string }>({
    name: 'headers',
    type: 'input',
    message: `Any authorization headers for ${endpoint}? (comma separated)`,
  });

  return convertHeadersInput(headers.split(/,/));
};

export const isURL = (input: string) => /^https?:\/\//.test(input);
