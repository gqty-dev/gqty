import { cosmiconfig, Loader } from 'cosmiconfig';
import { promises } from 'fs';
import { createRequire } from 'module';
import { resolve } from 'path';
import type { GenerateOptions } from './generate';
import { __innerState } from './innerState';
import type { IntrospectionOptions } from './introspection';

const cjsRequire =
  typeof require !== 'undefined' ? require : createRequire(import.meta.url);

export type GQtyConfig = Omit<GenerateOptions, 'endpoint'> & {
  /**
   * Introspection options
   */
  introspection?: IntrospectionOptions;
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

export const defaultConfig: Required<GQtyConfig> = {
  react: (() => {
    try {
      cjsRequire.resolve('react');
      return true;
    } catch (err) {}

    return false;
  })(),
  scalarTypes: {
    DateTime: 'string',
  },
  introspection: {
    endpoint: DUMMY_ENDPOINT,
    headers: {} as Record<string, string>,
  },
  destination: './src/gqty/index.ts',
  subscriptions: false,
  javascriptOutput: false,
  enumsAsStrings: false,
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
        case 'scalarTypes': {
          if (isStringRecord(value)) {
            newConfig[key] = value;
          } else {
            warnConfig(key, value, '"object of strings"', defaultConfig[key]);
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

type DeepReadonly<T> = T extends (infer R)[]
  ? DeepReadonlyArray<R>
  : T extends Function
  ? T
  : T extends object
  ? DeepReadonlyObject<T>
  : T;

interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}

type DeepReadonlyObject<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>;
};

const defaultGQtyConfig = {
  filepath: defaultFilePath,
  config: defaultConfig,
};

export const gqtyConfigPromise: Promise<{
  filepath: string;
  config: DeepReadonly<GQtyConfig>;
}> = new Promise(async (resolve) => {
  try {
    /* istanbul ignore else */
    if (process.env.NODE_ENV === 'test') {
      setTimeout(() => {
        resolve(defaultGQtyConfig);
      }, 10);
    } else {
      const cjsLoader: Loader = (filePath) => {
        return cjsRequire(filePath);
      };
      const config = await cosmiconfig('gqty', {
        searchPlaces: ['gqty.config.cjs', 'gqty.config.js', 'package.json'],
        loaders: {
          '.cjs': cjsLoader,
          '.js': cjsLoader,
        },
      }).search();

      if (!config || config.isEmpty) {
        const filepath = config?.filepath || defaultFilePath;

        const NODE_ENV = process.env['NODE_ENV'];

        if (
          NODE_ENV !== 'test' &&
          NODE_ENV !== 'production' &&
          __innerState.isCLI
        ) {
          const { format } = (await import('./prettier')).formatPrettier({
            parser: 'typescript',
          });

          const config: GQtyConfig = { ...defaultConfig };
          delete config.preImport;
          delete config.enumsAsStrings;

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
        return resolve({
          filepath,
          config: defaultConfig,
        });
      }

      resolve({
        config: getValidConfig(config.config),
        filepath: config.filepath,
      });
    }
  } catch (err) {
    console.error(err);
    resolve(defaultGQtyConfig);
  }
});
