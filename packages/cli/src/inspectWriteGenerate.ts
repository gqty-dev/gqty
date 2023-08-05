import { existsSync, promises } from 'fs';
import type { GraphQLSchema, IntrospectionQuery } from 'graphql';
import * as graphql from 'graphql';
import { extname, resolve } from 'path';
import { DUMMY_ENDPOINT, defaultConfig, loadOrGenerateConfig } from './config';
import * as deps from './deps.js';
import type { GenerateOptions, TransformSchemaOptions } from './generate';
import { getRemoteSchema } from './introspection';
import { writeGenerate } from './writeGenerate';

const { buildClientSchema, buildSchema } = graphql;

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

  const { config, filepath } = await loadOrGenerateConfig({
    writeConfigFile: true,
  });

  if (endpoint) {
    defaultConfig.introspection.endpoint = endpoint;
  } else if (existsSync(resolve('./schema.gql'))) {
    endpoint = './schema.gql';
    defaultConfig.introspection.endpoint = endpoint;
  } else {
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
    const configDestination = config.destination;

    destination = configDestination || defaultConfig.destination;
  }

  destination = resolve(destination);

  const genOptions = Object.assign({}, config, generateOptions);

  let schema: GraphQLSchema;

  defaultConfig.introspection.endpoint = endpoint;
  defaultConfig.introspection.headers = headers || {};

  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    schema = await getRemoteSchema(endpoint, {
      headers,
    });
  } else {
    defaultConfig.introspection.endpoint = DUMMY_ENDPOINT;

    const files = await deps.fg(endpoint);
    if (files.length) {
      const gqlextensions = ['.graphql', '.gql'];
      const jsonFiles = files.filter((file) => extname(file) === '.json');
      const gqlFiles = files.filter((file) =>
        gqlextensions.includes(extname(file))
      );

      // has invalid files (no graphql or json)
      if (files.length > jsonFiles.length + gqlFiles.length) {
        throw Error(
          `Received invalid files. Type generation can only use .gql, .graphql or .json files`
        );
      }

      // check for mixed input
      if (jsonFiles.length && gqlFiles.length) {
        throw Error(
          `Received mixed file inputs. Can not combine JSON and GQL files`
        );
      }

      // check for multiple JSON files
      if (jsonFiles.length && jsonFiles.length > 1) {
        throw Error(
          `Received multiple JSON introspection files, shoud only be one`
        );
      }

      const fileContents = await Promise.all(
        files.map((file) =>
          promises.readFile(file, {
            encoding: 'utf-8',
          })
        )
      );

      if (extname(files[0]) === '.json') {
        const parsedFile:
          | IntrospectionQuery
          | { data?: IntrospectionQuery }
          | undefined = JSON.parse(fileContents[0]);

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
        schema = buildSchema(fileContents.join('\n'));
      }
    } else {
      throw Error(
        `File "${endpoint}" doesn't exists. If you meant to inspect a GraphQL API, make sure to put http:// or https:// in front of it.`
      );
    }
  }

  const generatedPath = await writeGenerate(
    schema,
    destination,
    genOptions,
    async (existingFile) => {
      const subscriptions = genOptions.subscriptions ?? config.subscriptions;
      const react = genOptions.react ?? config.react;

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
    },
    transformSchemaOptions
  );

  if (cli) {
    console.log('Code generated successfully at ' + generatedPath);
  }
}
