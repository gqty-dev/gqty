import { promises } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import * as deps from './deps';
import type { GenerateOptions, SupportedFrameworks } from './generate';
import { __innerState } from './innerState';
import type { IntrospectionOptions } from './introspection';
import { formatPrettier } from './prettier';

const cjsRequire =
  globalThis.require || createRequire(import.meta.url.toString());

export type GQtyConfig = GenerateOptions & {
  /**
   * Introspection options
   *
   * @deprecated Use `introspections` instead
   */
  introspection?: IntrospectionOptions;
  /**
   * Introspection options for multple endpoints.
   *
   * ```json
   * {
   *   "https://example.com/graphql": {
   *     "headers": {
   *       "Authorization": "Bearer ..."
   *     }
   *   }
   * }
   * ```
   */
  introspections?: Record<string, Pick<RequestInit, 'headers'>>;
  /**
   * Client generation destination
   */
  destination?: string;
};

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return v != null && typeof v === 'object' && !Array.isArray(v);
}

function isStringRecord(v: unknown): v is Record<string, string> {
  return (
    isPlainObject(v) && Object.values(v).every((v) => typeof v === 'string')
  );
}

export const DUMMY_ENDPOINT = 'SPECIFY_ENDPOINT_OR_SCHEMA_FILE_PATH_HERE';

export type SetRequired<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>;

export const defaultConfig: SetRequired<
  GQtyConfig,
  Exclude<keyof GQtyConfig, 'react' | 'introspections' | 'transformSchema'>
> = {
  frameworks: (() => {
    const result: SupportedFrameworks[] = [];

    try {
      cjsRequire.resolve('react');
      result.push('react');
    } catch {
      // noop
    }

    try {
      cjsRequire.resolve('solid-js');
      result.push('solid-js');
    } catch {
      // noop
    }

    return result;
  })(),
  scalarTypes: {
    DateTime: 'string',
  },
  introspection: {
    endpoint: DUMMY_ENDPOINT,
    headers: {} as Record<string, string>,
  },
  endpoint: '/api/graphql',
  destination: './src/gqty/index.ts',
  subscriptions: false,
  javascriptOutput: false,
  enumStyle: 'enum',
  enumsAsStrings: false,
  enumsAsConst: false,
  preImport: '',
};

function warnConfig(
  fieldName: string,
  invalidValue: unknown,
  expectedValue: string,
  defaultValue: unknown
) {
  console.warn(
    `Warning, invalid config ${fieldName}, got: ${JSON.stringify(
      invalidValue
    )}, expected ${expectedValue}. ${JSON.stringify(
      defaultValue
    )} used instead.`
  );
}

export function getValidConfig(v: unknown): GQtyConfig {
  if (isPlainObject(v)) {
    const newConfig: GQtyConfig = {};

    if (typeof v.javascriptOutput === 'boolean') {
      newConfig.javascriptOutput = v.javascriptOutput;
    }

    for (const [key, value] of Object.entries(v)) {
      if (value === undefined) continue;

      switch (key) {
        case 'destination':
        case 'preImport': {
          if (typeof value === 'string') {
            newConfig[key] = value;
          } else {
            warnConfig(key, value, 'string', defaultConfig[key]);
          }

          break;
        }
        case 'javascriptOutput':
        case 'react':
        case 'subscriptions':
        case 'enumsAsStrings': {
          if (typeof value === 'boolean') {
            newConfig[key] = value;
          } else {
            warnConfig(key, value, 'boolean', defaultConfig[key]);
          }
          break;
        }
        case 'enumsAsConst': {
          if (typeof value === 'boolean') {
            newConfig[key] = value;
          } else {
            warnConfig(key, value, 'boolean', defaultConfig[key]);
          }
          break;
        }
        case 'scalarTypes': {
          if (isStringRecord(value)) {
            newConfig[key] = value;
          } else {
            warnConfig(key, value, '"object of strings"', defaultConfig[key]);
          }
          break;
        }
        case 'endpoint': {
          if (value && typeof value === 'string') {
            newConfig[key] = value;
          } else {
            warnConfig(key, value, 'string', defaultConfig[key]);
          }
          break;
        }
        case 'introspection': {
          if (isPlainObject(value)) {
            const introspectionOptions: IntrospectionOptions = {};
            for (const [introspectionKey, introspectionValue] of Object.entries(
              value
            )) {
              if (introspectionValue === undefined) continue;
              switch (introspectionKey) {
                case 'endpoint': {
                  if (typeof introspectionValue === 'string') {
                    introspectionOptions[introspectionKey] = introspectionValue;
                  } else {
                    warnConfig(
                      `${key}.${introspectionKey}`,
                      introspectionValue,
                      'string',
                      defaultConfig.introspection.endpoint
                    );
                  }
                  break;
                }
                case 'headers': {
                  if (isStringRecord(introspectionValue)) {
                    introspectionOptions[introspectionKey] = introspectionValue;
                  } else {
                    warnConfig(
                      `${key}.${introspectionKey}`,
                      introspectionValue,
                      '"object of strings"',
                      defaultConfig.introspection.headers
                    );
                  }
                  break;
                }
                default: {
                  console.warn(
                    `Warning, invalid and unused config property "${key}.${introspectionKey}": ${JSON.stringify(
                      value
                    )}`
                  );
                }
              }
            }

            newConfig[key] = introspectionOptions;
          } else {
            warnConfig(key, value, 'object', defaultConfig[key]);
          }
          break;
        }
        case 'introspections': {
          if (isPlainObject(value)) {
            const introspections: GQtyConfig['introspections'] = {};

            for (const [endpoint, httpExecutorOptions] of Object.entries(
              value
            )) {
              if (isPlainObject(httpExecutorOptions)) {
                introspections[endpoint] = httpExecutorOptions;
              } else {
                warnConfig(
                  `${key}.${endpoint}`,
                  httpExecutorOptions,
                  '"object of strings"',
                  {}
                );
              }
            }

            newConfig[key] = introspections;
          } else {
            warnConfig(key, value, 'object', defaultConfig[key]);
          }
          break;
        }
        case 'transformSchema': {
          if (typeof value === 'function') {
            newConfig[key] = value as GQtyConfig['transformSchema'];
          } else {
            warnConfig(key, value, 'function', 'undefined');
          }
          break;
        }
        default:
          console.warn(
            `Warning, invalid and unused config property "${key}": ${JSON.stringify(
              value
            )}`
          );
      }
    }

    return newConfig;
  } else {
    console.warn(
      'Invalid config, using instead: ' + JSON.stringify(defaultConfig, null, 2)
    );
    return defaultConfig;
  }
}

const defaultFilePath = resolve(process.cwd(), 'gqty.config.cjs');

const defaultGQtyConfig = {
  filepath: defaultFilePath,
  config: defaultConfig,
};

type GQtyConfigResult = {
  config: GQtyConfig;
  filepath: string;
  isEmpty?: boolean;
};

let gqtyConfigPromise: Promise<GQtyConfigResult> | undefined = undefined;

export const loadOrGenerateConfig = async ({
  writeConfigFile = false,
}: {
  writeConfigFile?: boolean;
} = {}): Promise<GQtyConfigResult> => {
  if (gqtyConfigPromise === undefined) {
    const promiseHandler = async () => {
      try {
        const cjsLoader: deps.Loader = (filePath) => {
          return cjsRequire(filePath);
        };
        const config = await deps
          .cosmiconfig('gqty', {
            searchPlaces: ['gqty.config.cjs', 'gqty.config.js', 'package.json'],
            loaders: {
              '.cjs': cjsLoader,
              '.js': cjsLoader,
            },
          })
          .search();

        if (!config || config.isEmpty) {
          const filepath = config?.filepath || defaultFilePath;

          const NODE_ENV = process.env['NODE_ENV'];

          if (
            NODE_ENV !== 'test' &&
            NODE_ENV !== 'production' &&
            __innerState.isCLI
          ) {
            const { format } = formatPrettier({
              parser: 'typescript',
            });

            const config: GQtyConfig = { ...defaultConfig };
            delete config.preImport;
            delete config.enumsAsStrings;

            if (writeConfigFile) {
              await promises.writeFile(
                defaultFilePath,
                await format(`
                          /**
                           * @type {import("@gqty/cli").GQtyConfig}
                           */
                          const config = ${JSON.stringify(config)};

                          module.exports = config;`)
              );
            }
          }

          return {
            filepath,
            config: defaultConfig,
          };
        }

        return {
          config: getValidConfig(config.config),
          filepath: config.filepath,
        };
      } catch (err) {
        console.error(err);

        return defaultGQtyConfig;
      }
    };

    gqtyConfigPromise = promiseHandler();
  }

  return gqtyConfigPromise;
};
