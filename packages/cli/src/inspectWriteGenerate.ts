import { existsSync } from 'fs';
import { promises } from 'fs';
import {
  buildClientSchema,
  buildSchema,
  GraphQLSchema,
  IntrospectionQuery,
} from 'graphql';
import { resolve } from 'path';

import { defaultConfig, DUMMY_ENDPOINT, gqtyConfigPromise } from './config';

import type { GenerateOptions, TransformSchemaOptions } from './generate';

export async function inspectWriteGenerate({
  endpoint,
  destination,
  generateOptions,
  cli,
  headers,
  transformSchemaOptions,
}: {
  /**
   * GraphQL API endpoint or GraphQL Schema file
   *
   * @example 'http://localhost:3000/graphql'
   * @example './schema.gql'
   */
  endpoint?: string;
  /**
   * File path destination
   * @example './src/gqty/index.ts'
   */
  destination?: string;
  /**
   * Specify generate options
   */
  generateOptions?: GenerateOptions;
  /**
   * Whether it's being called through the CLI
   */
  cli?: boolean;
  /**
   * Specify headers for the introspection HTTP request
   */
  headers?: Record<string, string>;
  /**
   * Specify schema transforms
   */
  transformSchemaOptions?: TransformSchemaOptions;
} = {}) {
  if (destination) {
    defaultConfig.destination = destination;
  }

  if (endpoint) {
    defaultConfig.introspection.endpoint = endpoint;
  } else if (existsSync(resolve('./schema.gql'))) {
    endpoint = './schema.gql';
    defaultConfig.introspection.endpoint = endpoint;
  } else {
    const { config, filepath } = await gqtyConfigPromise;

    const configIntrospectionEndpoint =
      config.introspection && config.introspection.endpoint;

    if (
      configIntrospectionEndpoint &&
      configIntrospectionEndpoint !== DUMMY_ENDPOINT
    ) {
      endpoint = configIntrospectionEndpoint;
    } else {
      console.error(
        `\nPlease modify "${
          filepath.endsWith('package.json') ? 'gqty' : 'config'
        }.introspection.endpoint" in: "${filepath}".`
      );
      throw Error(
        'ERROR: No introspection endpoint specified in configuration file.'
      );
    }
  }

  if (!destination) {
    const configDestination = (await gqtyConfigPromise).config.destination;

    destination = configDestination || defaultConfig.destination;
  }

  destination = resolve(destination);

  const genOptions = Object.assign({}, generateOptions);

  let schema: GraphQLSchema;

  defaultConfig.introspection.endpoint = endpoint;
  defaultConfig.introspection.headers = headers || {};

  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    schema = await (
      await import('./introspection')
    ).getRemoteSchema(endpoint, {
      headers,
    });
  } else {
    defaultConfig.introspection.endpoint = DUMMY_ENDPOINT;

    if (existsSync(endpoint)) {
      const file = await promises.readFile(endpoint, {
        encoding: 'utf-8',
      });

      if (endpoint.endsWith('.json')) {
        const parsedFile:
          | IntrospectionQuery
          | { data?: IntrospectionQuery }
          | undefined = JSON.parse(file);

        let dataField: IntrospectionQuery | undefined;

        if (typeof parsedFile === 'object') {
          if ('data' in parsedFile && parsedFile.data) {
            dataField = parsedFile.data;
          } else if ('__schema' in parsedFile) {
            dataField = parsedFile;
          }
        }

        if (!(typeof dataField === 'object'))
          throw Error(
            'Invalid JSON introspection result, expected "__schema" or "data.__schema" field.'
          );

        schema = buildClientSchema(dataField);
      } else {
        schema = buildSchema(file);
      }
    } else {
      throw Error(
        `File "${endpoint}" doesn't exists. If you meant to inspect a GraphQL API, make sure to put http:// or https:// in front of it.`
      );
    }
  }

  const generatedPath = await (
    await import('./writeGenerate')
  ).writeGenerate(
    schema,
    destination,
    genOptions,
    async (existingFile) => {
      const subscriptions =
        genOptions.subscriptions ??
        (await gqtyConfigPromise).config.subscriptions;
      const react = genOptions.react ?? (await gqtyConfigPromise).config.react;

      const advice = `\nIf you meant to change this, please remove "${destination}" and re-run code generation.`;

      if (subscriptions) {
        if (!existingFile.includes('createSubscriptionsClient')) {
          console.warn(
            `[Warning] You've changed the option "subscriptions" to 'true', which is different from your existing "${destination}".` +
              advice
          );
        }
      }
      if (react) {
        if (!existingFile.includes('createReactClient')) {
          console.warn(
            `[Warning] You've changed the option "react" to 'true', which is different from your existing "${destination}".` +
              advice
          );
        }
      }

      if (existingFile.includes('export const {')) {
        console.warn(
          `[Warning] To prevent possible bundling issues, it's recommended to change the export syntax from "export const { query, ... } = client;" to "const { query, ... } = client; export { query, ... };"`
        );
      }
    },
    transformSchemaOptions
  );

  if (cli) {
    console.log('Code generated successfully at ' + generatedPath);
  }
}
