import {
  SchemaUnionsKey,
  parseSchemaType,
  type ArgsDescriptions,
  type FieldDescription,
  type ScalarsEnumsHash,
  type Schema,
  type Type,
} from 'gqty/Schema/types';
import type {
  GraphQLEnumType,
  GraphQLField,
  GraphQLInputObjectType,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLSchema,
  GraphQLUnionType,
} from 'graphql';
import * as graphql from 'graphql';
import { defaultConfig, type GQtyConfig } from './config';
import * as deps from './deps.js';
import { formatPrettier } from './prettier';

const {
  isEnumType,
  isInputObjectType,
  isInterfaceType,
  isNullableType,
  isObjectType,
  isScalarType,
  isUnionType,
  lexicographicSortSchema,
  parse,
  isSchema,
  assertSchema,
} = graphql;

export interface GenerateOptions {
  /**
   * The endpoint to use for the `queryFetcher` function
   */
  endpoint?: string;
  /**
   * Customize the TypeScript types for scalars.
   *
   * You can use the `preImport` option to import / define custom types.
   *
   * @example
   * ```json
   * scalarTypes: {
   *   DateTime: "string",
   * }
   * ```
   */
  scalarTypes?: Record<string, string>;
  /**
   * Prepend code to the schema file, useful with the `scalarTypes` option.
   */
  preImport?: string;
  /**
   * Generate React Client code
   */
  react?: boolean;
  /**
   * Define enums as string types instead of enums objects
   * @default false
   */
  enumsAsStrings?: boolean;
  /**
   * Define enums as const types instead of enums objects
   * @default false
   */
  enumsAsConst?: boolean;
  /**
   * Generate subscriptions client with target package
   * @default false
   */
  subscriptions?: boolean | string;
  /**
   * Generate Javascript code instead of TypeScript
   *
   * @default false
   */
  javascriptOutput?: boolean;
  /**
   * Transform the GraphQL Schema before being used to generate the client
   */
  transformSchema?: (
    schema: GraphQLSchema,
    graphql_js: typeof graphql
  ) => Promise<GraphQLSchema> | GraphQLSchema;
}

export interface TransformSchemaOptions {
  /**
   * Get a field in which every argument is optional, if this functions return "true", gqty will _always__ ignore it's arguments,
   * and you won't be able to specify them
   */
  ignoreArgs?: (type: GraphQLField<unknown, unknown>) => boolean;
}

export async function generate(
  schema: GraphQLSchema,
  {
    endpoint,
    enumsAsConst,
    enumsAsStrings,
    introspection,
    javascriptOutput,
    preImport,
    react,
    scalarTypes,
    subscriptions,
    transformSchema,
  }: GQtyConfig = {},
  { ignoreArgs }: TransformSchemaOptions = {}
): Promise<{
  clientCode: string;
  schemaCode: string;
  javascriptSchemaCode: string;
  generatedSchema: Schema;
  scalarsEnumsHash: ScalarsEnumsHash;
  isJavascriptOutput: boolean;
}> {
  const isJavascriptOutput = javascriptOutput ?? defaultConfig.javascriptOutput;

  if (isJavascriptOutput) {
    if (enumsAsStrings) {
      console.warn(
        `"enumsAsStrings" is automatically set as "true" with "javascriptOutput" enabled.`
      );
    }
    enumsAsStrings = true;
  } else {
    enumsAsStrings ??= false;
  }

  if (isJavascriptOutput) {
    if (enumsAsConst) {
      console.warn(
        `"enumsAsConst" is automatically set as "false" with "javascriptOutput" enabled.`
      );
    }
    enumsAsConst = false;
  }
  enumsAsConst ??= enumsAsConst ?? defaultConfig.enumsAsConst;

  scalarTypes ||= scalarTypes || defaultConfig.scalarTypes;
  endpoint ||=
    endpoint ||
    introspection?.endpoint ||
    defaultConfig.endpoint ||
    defaultConfig.introspection.endpoint;

  react ??= defaultConfig.react;
  preImport ??= defaultConfig.preImport;
  subscriptions ??= defaultConfig.subscriptions;

  const { format } = formatPrettier({
    parser: 'typescript',
  });

  schema = lexicographicSortSchema(assertSchema(schema));

  if (transformSchema) {
    schema = await transformSchema(schema, graphql);

    if (!isSchema(schema)) {
      throw Error(`"transformSchema" returned an invalid GraphQL Schema!`);
    }
  }

  const codegenResultPromise = deps.codegen({
    schema: parse(deps.printSchemaWithDirectives(schema)),
    config: {} as deps.typescriptPlugin.TypeScriptPluginConfig,
    documents: [],
    filename: 'gqty.generated.ts',
    pluginMap: {
      typescript: deps.typescriptPlugin,
    },
    plugins: [
      {
        typescript: {
          onlyOperationTypes: true,
          declarationKind: 'interface',
          addUnderscoreToArgsType: true,
          scalars: scalarTypes,
          namingConvention: 'keep',
          enumsAsTypes: enumsAsStrings,
          enumsAsConst: enumsAsConst,
        } as deps.typescriptPlugin.TypeScriptPluginConfig,
      },
    ],
  });

  const config = schema.toConfig();

  const scalarsEnumsHash: ScalarsEnumsHash = {};

  const enumsNames: string[] = [];

  const inputTypeNames = new Set<string>();

  const generatedSchema: Schema = {
    query: {},
    mutation: {},
    subscription: {},
  };

  const queryType = config.query;
  const mutationType = config.mutation;
  const subscriptionType = config.subscription;

  const descriptions = new Map<string, string>();

  const fieldsDescriptions = new Map<
    string,
    Record<string, FieldDescription | undefined>
  >();

  const fieldsArgsDescriptions = new Map<string, ArgsDescriptions>();

  function addDescription(
    typeName: string | [parent: string, field: string, arg?: string]
  ) {
    if (Array.isArray(typeName)) {
      const data = typeName[2]
        ? /* istanbul ignore next */
          fieldsArgsDescriptions.get(typeName[0])?.[typeName[1]]?.[typeName[2]]
        : /* istanbul ignore next */
          fieldsDescriptions.get(typeName[0])?.[typeName[1]];

      let comment = '';

      if (data?.description) {
        comment +=
          '\n' +
          data.description
            .trim()
            .split('\n')
            .map((line) => '* ' + line)
            .join('\n');
      }

      if (data?.deprecated) {
        comment +=
          '\n* @deprecated ' +
          data.deprecated.trim().replace(/\n/g, '. ').trim();
      }

      if (data?.defaultValue) {
        comment += '\n* @defaultValue ' + '`' + data.defaultValue.trim() + '`';
      }

      return comment
        ? `/** ${comment}
      */\n`
        : '';
    } else {
      const desc = descriptions.get(typeName);
      return desc
        ? `/**
        ${desc
          .trim()
          .split('\n')
          .map((line) => '* ' + line)
          .join('\n')}
      */\n`
        : '';
    }
  }

  const parseEnumType = (type: GraphQLEnumType) => {
    scalarsEnumsHash[type.name] = true;
    enumsNames.push(type.name);

    const values = type.getValues();

    const enumValuesDescriptions: Record<string, FieldDescription> = {};

    for (const value of values) {
      if (value.deprecationReason || value.description) {
        enumValuesDescriptions[value.name] = {
          description: value.description,
          deprecated: value.deprecationReason,
        };
      }
    }

    fieldsDescriptions.set(type.name, enumValuesDescriptions);
  };
  const parseScalarType = (type: GraphQLScalarType) => {
    scalarsEnumsHash[type.name] = true;
  };

  const interfacesOfObjectTypesMap = new Map<string, string[]>();

  const parseObjectType = (type: GraphQLObjectType, typeName = type.name) => {
    const fields = type.getFields();
    const interfaces = type.getInterfaces();

    if (interfaces.length) {
      interfacesOfObjectTypesMap.set(
        type.name,
        interfaces.map((v) => v.name)
      );

      for (const interfaceType of interfaces) {
        let objectTypesList = unionsAndInterfacesObjectTypesMap.get(
          interfaceType.name
        );

        if (objectTypesList == null) {
          unionsAndInterfacesObjectTypesMap.set(
            interfaceType.name,
            (objectTypesList = [])
          );
        }

        objectTypesList.push(type.name);
      }
    }

    const schemaType: Record<string, Type> = {
      __typename: { __type: 'String!' },
    };

    const objectFieldsDescriptions: Record<string, FieldDescription> = {};

    const objectFieldsArgsDescriptions: ArgsDescriptions = {};

    Object.entries(fields).forEach(([fieldName, gqlType]) => {
      if (gqlType.description || gqlType.deprecationReason) {
        objectFieldsDescriptions[fieldName] = {
          description: gqlType.description,
          deprecated: gqlType.deprecationReason,
        };
      }

      schemaType[fieldName] = {
        __type: gqlType.type.toString(),
      };

      if (gqlType.args.length) {
        if (ignoreArgs) {
          const isEveryArgOptional = gqlType.args.every(({ type }) => {
            return isNullableType(type);
          });

          if (isEveryArgOptional) {
            const shouldIgnore = ignoreArgs(gqlType);

            if (shouldIgnore) return;
          }
        }
        objectFieldsArgsDescriptions[fieldName] ||= {};

        schemaType[fieldName].__args = gqlType.args.reduce((acum, arg) => {
          acum[arg.name] = arg.type.toString();
          if (
            arg.description ||
            arg.deprecationReason ||
            arg.defaultValue != null
          ) {
            objectFieldsArgsDescriptions[fieldName][arg.name] = {
              defaultValue:
                arg.defaultValue != null
                  ? JSON.stringify(arg.defaultValue)
                  : null,
              deprecated: arg.deprecationReason,
              description: arg.description,
            };
          }
          return acum;
        }, {} as Record<string, string>);
      }
    });

    fieldsDescriptions.set(type.name, objectFieldsDescriptions);
    fieldsArgsDescriptions.set(type.name, objectFieldsArgsDescriptions);

    generatedSchema[typeName] = schemaType;
  };

  const unionsAndInterfacesObjectTypesMap = new Map<string, string[]>();

  const parseUnionType = (type: GraphQLUnionType) => {
    const unionTypes = type.getTypes();

    const list: string[] = [];
    unionsAndInterfacesObjectTypesMap.set(type.name, list);

    for (const objectType of unionTypes) {
      list.push(objectType.name);
    }

    generatedSchema[type.name] = {
      __typename: { __type: 'String!' },
    };
  };

  const parseInputType = (type: GraphQLInputObjectType) => {
    inputTypeNames.add(type.name);
    const fields = type.getFields();

    const schemaType: Record<string, Type> = {};

    const inputFieldDescriptions: Record<string, FieldDescription> = {};

    Object.entries(fields).forEach(([key, value]) => {
      schemaType[key] = {
        __type: value.type.toString(),
      };
      if (value.description || value.deprecationReason || value.defaultValue) {
        inputFieldDescriptions[key] = {
          description: value.description,
          deprecated: value.deprecationReason,
          defaultValue:
            value.defaultValue != null
              ? JSON.stringify(value.defaultValue)
              : null,
        };
      }
    });

    generatedSchema[type.name] = schemaType;
  };

  type InterfaceMapValue = {
    fieldName: string;
  } & Type;

  const parseInterfaceType = (type: GraphQLInterfaceType) => {
    const schemaType: Record<string, Type> = {
      __typename: { __type: 'String!' },
    };

    const fields = type.getFields();

    const interfaceFieldDescriptions: Record<string, FieldDescription> = {};

    const objectFieldsArgsDescriptions: ArgsDescriptions = {};

    Object.entries(fields).forEach(([fieldName, gqlType]) => {
      const interfaceValue: InterfaceMapValue = {
        fieldName,
        __type: gqlType.type.toString(),
      };
      schemaType[fieldName] = {
        __type: gqlType.type.toString(),
      };

      let hasArgs = true;
      if (gqlType.args.length) {
        if (ignoreArgs) {
          const isEveryArgOptional = gqlType.args.every(({ type }) => {
            return isNullableType(type);
          });

          if (isEveryArgOptional) {
            const shouldIgnore = ignoreArgs(gqlType);

            if (shouldIgnore) {
              hasArgs = false;
            }
          }
        }
      } else {
        hasArgs = false;
      }

      if (hasArgs) {
        objectFieldsArgsDescriptions[fieldName] ||= {};

        schemaType[fieldName].__args = interfaceValue.__args =
          gqlType.args.reduce((acum, arg) => {
            acum[arg.name] = arg.type.toString();
            if (
              arg.description ||
              arg.deprecationReason ||
              arg.defaultValue != null
            ) {
              objectFieldsArgsDescriptions[fieldName][arg.name] = {
                defaultValue:
                  arg.defaultValue != null
                    ? JSON.stringify(arg.defaultValue)
                    : null,
                deprecated: arg.deprecationReason,
                description: arg.description,
              };
            }
            return acum;
          }, {} as Record<string, string>);
      }

      if (gqlType.description || gqlType.deprecationReason) {
        interfaceFieldDescriptions[fieldName] = {
          description: gqlType.description,
          deprecated: gqlType.deprecationReason,
        };
      }
    });
    fieldsDescriptions.set(type.name, interfaceFieldDescriptions);

    fieldsArgsDescriptions.set(type.name, objectFieldsArgsDescriptions);

    generatedSchema[type.name] = schemaType;
  };

  config.types.forEach((type) => {
    if (type.description) {
      descriptions.set(type.name, type.description);
    }
    if (
      type.name.startsWith('__') ||
      type === queryType ||
      type === mutationType ||
      type === subscriptionType
    ) {
      return;
    }

    /* istanbul ignore else */
    if (isScalarType(type)) {
      parseScalarType(type);
    } else if (isObjectType(type)) {
      parseObjectType(type);
    } else if (isInterfaceType(type)) {
      parseInterfaceType(type);
    } else if (isUnionType(type)) {
      parseUnionType(type);
    } else if (isEnumType(type)) {
      parseEnumType(type);
    } else if (isInputObjectType(type)) {
      parseInputType(type);
    }
  });

  /* istanbul ignore else */
  if (queryType) {
    parseObjectType(queryType, 'query');
  }

  if (mutationType) {
    parseObjectType(mutationType, 'mutation');
  }

  if (subscriptionType) {
    parseObjectType(subscriptionType, 'subscription');
  }

  const unionsMapObj = Array.from(
    unionsAndInterfacesObjectTypesMap.entries()
  ).reduce((acum, [key, value]) => {
    generatedSchema[key]!.$on = { __type: `$${key}!` };

    acum[key] = value;
    return acum;
  }, {} as Record<string, string[]>);

  if (unionsAndInterfacesObjectTypesMap.size) {
    generatedSchema[SchemaUnionsKey] = unionsMapObj;
  }

  function parseArgType({
    pureType,
    isArray,
    nullableItems,
    isNullable,
    hasDefaultValue,
  }: ReturnType<typeof parseSchemaType>) {
    let typeToReturn: string[] = [
      scalarsEnumsHash[pureType]
        ? enumsNames.includes(pureType)
          ? pureType
          : `Scalars["${pureType}"]`
        : pureType,
    ];

    if (isArray) {
      typeToReturn = [
        'Array<',
        ...(nullableItems ? ['Maybe<', ...typeToReturn, '>'] : typeToReturn),
        '>',
      ];
    }

    if (isNullable || hasDefaultValue) {
      typeToReturn = ['Maybe<', ...typeToReturn, '>'];
    }

    return typeToReturn.join('');
  }

  function parseFinalType({
    pureType,
    isArray,
    nullableItems,
    isNullable,
  }: ReturnType<typeof parseSchemaType>) {
    let typeToReturn: string[] = [
      scalarsEnumsHash[pureType] ? `ScalarsEnums["${pureType}"]` : pureType,
    ];

    if (isArray) {
      typeToReturn = [
        'Array<',
        ...(nullableItems ? ['Maybe<', ...typeToReturn, '>'] : typeToReturn),
        '>',
      ];
    }

    if (isNullable) {
      typeToReturn = ['Maybe<', ...typeToReturn, '>'];
    }

    return typeToReturn.join('');
  }

  const objectTypeTSTypes = new Map<string, Map<string, string>>();

  let typescriptTypes = deps
    .sortBy(Object.entries(generatedSchema), (v) => v[0])
    .reduce((acum, [typeKey, typeValue]) => {
      const typeName = (() => {
        switch (typeKey) {
          case 'query': {
            return 'Query';
          }
          case 'mutation': {
            return 'Mutation';
          }
          case 'subscription': {
            return 'Subscription';
          }
          default: {
            return typeKey;
          }
        }
      })();

      if (inputTypeNames.has(typeName)) return acum;

      const objectTypeMap = new Map<string, string>();

      if (!unionsAndInterfacesObjectTypesMap.has(typeName)) {
        objectTypeTSTypes.set(typeName, objectTypeMap);
      }

      const interfaceOrUnionsObjectTypes =
        unionsAndInterfacesObjectTypesMap.get(typeName);

      acum += `

      ${addDescription(typeName)}export interface ${typeName} {
        __typename?: ${
          interfaceOrUnionsObjectTypes
            ? interfaceOrUnionsObjectTypes.map((v) => `"${v}"`).join(' | ')
            : `"${typeName}"`
        }; ${Object.entries(typeValue!).reduce(
        (acum, [fieldKey, fieldValue]) => {
          if (fieldKey === '__typename') {
            objectTypeMap.set(fieldKey, `?: "${typeName}"`);
            return acum;
          }

          const typeFieldArgDescriptions = fieldsArgsDescriptions.has(typeName)
            ? fieldsArgsDescriptions.get(typeName)
            : undefined;
          const argDescriptions =
            typeFieldArgDescriptions && typeFieldArgDescriptions[fieldKey]
              ? typeFieldArgDescriptions[fieldKey]
              : {};
          const fieldValueProps = parseSchemaType(fieldValue.__type);
          const typeToReturn = parseFinalType(fieldValueProps);
          let finalType: string;
          if (fieldValue.__args) {
            const argsEntries = Object.entries(fieldValue.__args);
            let onlyNullableArgs = true;
            const argTypes = argsEntries.reduce((acum, [argKey, argValue]) => {
              const argValueProps = parseSchemaType(
                argValue,
                argDescriptions[argKey]
              );
              const connector =
                argValueProps.isNullable || argValueProps.hasDefaultValue
                  ? '?:'
                  : ':';

              if (!argValueProps.isNullable) {
                onlyNullableArgs = false;
              }

              const argTypeValue = parseArgType(argValueProps);

              acum += `${addDescription([
                typeName,
                fieldKey,
                argKey,
              ])}${argKey}${connector} ${argTypeValue};\n`;

              return acum;
            }, '');
            const argsConnector = onlyNullableArgs ? '?:' : ':';
            finalType = `: (args${argsConnector} {${argTypes}}) => ${typeToReturn}`;
          } else {
            const connector = fieldValueProps.isNullable ? '?:' : ':';
            finalType = `${connector} ${typeToReturn}`;
          }

          objectTypeMap.set(fieldKey, finalType);

          acum +=
            '\n' + addDescription([typeName, fieldKey]) + fieldKey + finalType;

          return acum;
        },
        ''
      )}
      }
      `;

      return acum;
    }, '');

  if (unionsAndInterfacesObjectTypesMap.size) {
    typescriptTypes += `
    ${deps
      .sortBy(
        Array.from(unionsAndInterfacesObjectTypesMap.entries()),
        (v) => v[0]
      )
      .reduce((acum, [unionInterfaceName, objectTypes]) => {
        acum += `
      export interface $${unionInterfaceName} {
        ${objectTypes.map((typeName) => `${typeName}?:${typeName}`).join('\n')}
      }
      `;

        return acum;
      }, '')}
    `;
  }

  typescriptTypes += `
    export interface GeneratedSchema {
      query: Query
      mutation: Mutation
      subscription: Subscription
    }

    export type MakeNullable<T> = {
      [K in keyof T]: T[K] | undefined;
    };

    export interface ScalarsEnums extends MakeNullable<Scalars> {
      ${deps.sortBy(enumsNames).reduce((acum, enumName) => {
        acum += `${enumName}: ${enumName} | undefined;`;
        return acum;
      }, '')}
    }
    `;

  function typeDoc(type: string) {
    return `/**\n * @type {${type}}\n */\n`;
  }

  const queryFetcher = `
    ${
      isJavascriptOutput
        ? typeDoc('import("gqty").QueryFetcher') + 'const queryFetcher'
        : 'const queryFetcher: QueryFetcher'
    } = async function ({ query, variables, operationName }, fetchOptions) {
        // Modify "${endpoint}" if needed
        const response = await fetch("${endpoint}", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query,
            variables,
            operationName,
          }),
          mode: "cors",
          ...fetchOptions
        });

        if (response.status >= 400) {
          throw new GQtyError(
            \`GraphQL endpoint responded with HTTP \${response.status}: \${response.statusText}.\`
          );
        }

        const text = await response.text();

        try {
          return JSON.parse(text);
        } catch {
          throw new GQtyError(
            \`Malformed JSON response: \${
              text.length > 50 ? text.slice(0, 50) + '...' : text
            }\`
          );
        }
      };
    `;

  const hasUnions = !!unionsAndInterfacesObjectTypesMap.size;

  const scalarsEnumsHashString = JSON.stringify(
    Object.keys(scalarsEnumsHash)
      .sort()
      .reduce<ScalarsEnumsHash>((acum, key) => {
        acum[key] = true;
        return acum;
      }, {})
  );

  const generatedSchemaCodeString = deps
    .sortBy(Object.entries(generatedSchema), (v) => v[0])
    .reduceRight(
      (acum, [key, value]) => {
        return `${JSON.stringify(key)}:${JSON.stringify(value)}, ${acum}`;
      },
      hasUnions ? `[SchemaUnionsKey]: ${JSON.stringify(unionsMapObj)}` : ''
    );

  const javascriptSchemaCode = await format(`
    /**
     * GQty AUTO-GENERATED CODE: PLEASE DO NOT MODIFY MANUALLY
     */

    ${hasUnions ? 'import { SchemaUnionsKey } from "gqty";' : ''}

    ${typeDoc(
      'import("gqty").ScalarsEnumsHash'
    )}export const scalarsEnumsHash = ${scalarsEnumsHashString};

    export const generatedSchema = {${generatedSchemaCodeString}};
  `);

  const schemaCode = await format(`
    /**
     * GQty AUTO-GENERATED CODE: PLEASE DO NOT MODIFY MANUALLY
     */

    ${preImport}

    ${hasUnions ? 'import { SchemaUnionsKey } from "gqty";' : ''}

    ${await codegenResultPromise}

    export${
      isJavascriptOutput ? ' declare' : ''
    } const scalarsEnumsHash: import("gqty").ScalarsEnumsHash${
    isJavascriptOutput ? ';' : ` = ${scalarsEnumsHashString};`
  }
    export${isJavascriptOutput ? ' declare' : ''} const generatedSchema ${
    isJavascriptOutput ? ':' : '='
  } {${generatedSchemaCodeString}}${isJavascriptOutput ? '' : ' as const'};

    ${typescriptTypes}
  `);

  const reactClientCode = react
    ? `
        export const {
          graphql,
          useQuery,
          usePaginatedQuery,
          useTransactionQuery,
          useLazyQuery,
          useRefetch,
          useMutation,
          useMetaState,
          prepareReactRender,
          useHydrateCache,
          prepareQuery,
          ${subscriptions ? 'useSubscription,' : ''}
        } = ${
          isJavascriptOutput
            ? `${typeDoc(
                'import("@gqty/react").ReactClient<import("./schema.generated").GeneratedSchema>'
              )}createReactClient(client, {`
            : `createReactClient<GeneratedSchema>(client, {`
        }
          defaults: {
            // Enable Suspense, you can override this option at hooks.
            suspense: false,
          }
        });
      `.trim()
    : '';

  const clientCode = await format(`
    /**
     * GQty: You can safely modify this file based on your needs.
     */

    ${[
      react ? `import { createReactClient } from "@gqty/react";` : '',
      subscriptions
        ? `import { createClient as createSubscriptionsClient } from "${
            subscriptions === true ? 'graphql-ws' : subscriptions
          }";`
        : '',
      isJavascriptOutput
        ? 'import { Cache, GQtyError, createClient } from "gqty";'
        : 'import { Cache, GQtyError, createClient, type QueryFetcher } from "gqty";',
      isJavascriptOutput
        ? 'import { generatedSchema, scalarsEnumsHash } from "./schema.generated";'
        : 'import { generatedSchema, scalarsEnumsHash, type GeneratedSchema } from "./schema.generated";',
    ]
      .filter(Boolean)
      .join('\n')}

    ${queryFetcher}

    ${
      subscriptions
        ? `const subscriptionsClient =
      typeof window !== "undefined" ?
        createSubscriptionsClient({
          lazy: true,
          url: () => {
            // Modify if needed
            const url = new URL("${endpoint}", window.location.href);
            url.protocol = url.protocol.replace('http', 'ws');
            return url.href;
          }
        }) : undefined;`
        : ''
    }

    const cache = new Cache(
      undefined,
      /**
       * Default option is immediate cache expiry but keep it for 5 minutes,
       * allowing soft refetches in background.
       */
      {
        maxAge: 0,
        staleWhileRevalidate: 5 * 60 * 1000,
        normalization: true,
      }
    );

    ${
      isJavascriptOutput
        ? `${typeDoc(
            'import("gqty").GQtyClient<import("./schema.generated").GeneratedSchema>'
          )}export const client = createClient({
      schema: generatedSchema,
      scalars: scalarsEnumsHash,
      cache,
      fetchOptions: {
        fetcher: queryFetcher,
        ${subscriptions ? 'subscriber: subscriptionsClient' : ''}
      },
    });
    `
        : `
    export const client = createClient<GeneratedSchema>({
      schema: generatedSchema,
      scalars: scalarsEnumsHash,
      cache,
      fetchOptions:{
        fetcher: queryFetcher,
        ${subscriptions ? 'subscriber: subscriptionsClient' : ''}
      },
    });
    `
    }

    // Core functions
    export const { resolve, subscribe, schema } = client;

    // Legacy functions
    export const { query, mutation, mutate, subscription, resolved, refetch, track } = client;

    ${reactClientCode}

    export * from "./schema.generated";
  `);

  return {
    clientCode,
    generatedSchema,
    isJavascriptOutput,
    javascriptSchemaCode,
    scalarsEnumsHash,
    schemaCode,
  };
}
