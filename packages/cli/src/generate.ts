import { codegen } from '@graphql-codegen/core';
import * as typescriptPlugin from '@graphql-codegen/typescript';
import { printSchemaWithDirectives } from '@graphql-tools/utils';
import {
  parseSchemaType,
  ScalarsEnumsHash,
  Schema,
  SchemaUnionsKey,
  Type,
} from 'gqty';
import {
  GraphQLEnumType,
  GraphQLField,
  GraphQLInputObjectType,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLSchema,
  GraphQLUnionType,
  isEnumType,
  isInputObjectType,
  isInterfaceType,
  isNullableType,
  isObjectType,
  isScalarType,
  isUnionType,
  parse,
} from 'graphql';
import sortBy from 'lodash/sortBy.js';
import { defaultConfig, gqtyConfigPromise } from './config';
import { formatPrettier } from './prettier';

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
   * Generate subscriptions client
   * @default false
   */
  subscriptions?: boolean;
  /**
   * Generate Javascript code instead of TypeScript
   *
   * @default false
   */
  javascriptOutput?: boolean;
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
    preImport,
    scalarTypes,
    react,
    endpoint,
    enumsAsStrings,
    subscriptions,
    javascriptOutput,
  }: GenerateOptions = {},
  { ignoreArgs }: TransformSchemaOptions = {}
): Promise<{
  clientCode: string;
  schemaCode: string;
  javascriptSchemaCode: string;
  generatedSchema: Schema;
  scalarsEnumsHash: ScalarsEnumsHash;
  isJavascriptOutput: boolean;
}> {
  const gqtyConfig = (await gqtyConfigPromise).config;

  const isJavascriptOutput =
    javascriptOutput ??
    gqtyConfig.javascriptOutput ??
    defaultConfig.javascriptOutput;

  if (isJavascriptOutput) {
    if (gqtyConfig.enumsAsStrings) {
      console.warn(
        `"enumsAsStrings" is automatically set as "true" with "javascriptOutput" enabled.`
      );
    }
    enumsAsStrings = true;
  } else {
    enumsAsStrings ??= gqtyConfig.enumsAsStrings ?? false;
  }

  scalarTypes ||= gqtyConfig.scalarTypes || defaultConfig.scalarTypes;
  endpoint ||=
    gqtyConfig.introspection?.endpoint ?? defaultConfig.introspection.endpoint;

  if (
    endpoint == null ||
    !(endpoint.startsWith('http://') && endpoint.startsWith('https://'))
  ) {
    endpoint = '/api/graphql';
  }

  react ??= gqtyConfig.react ?? defaultConfig.react;
  preImport ??= gqtyConfig.preImport ?? defaultConfig.preImport;
  subscriptions ??= gqtyConfig.subscriptions ?? defaultConfig.subscriptions;

  const { format } = formatPrettier({
    parser: 'typescript',
  });

  const codegenResultPromise = codegen({
    schema: parse(printSchemaWithDirectives(schema)),
    config: {} as typescriptPlugin.TypeScriptPluginConfig,
    documents: [],
    filename: 'gqty.generated.ts',
    pluginMap: {
      typescript: typescriptPlugin,
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
        } as typescriptPlugin.TypeScriptPluginConfig,
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

  interface FieldDescription {
    description?: string | null;
    deprecated?: string | null;
    defaultValue?: string | null;
  }

  const fieldsDescriptions = new Map<
    string,
    Record<string, FieldDescription | undefined>
  >();

  type ArgsDescriptions = Record<
    string,
    Record<string, FieldDescription | undefined>
  >;

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
      if (value.isDeprecated || value.description) {
        enumValuesDescriptions[value.name] = {
          description: value.description,
          deprecated: value.isDeprecated ? value.deprecationReason : undefined,
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
      if (gqlType.description || gqlType.isDeprecated) {
        objectFieldsDescriptions[fieldName] = {
          description: gqlType.description,
          deprecated: gqlType.isDeprecated ? gqlType.deprecationReason : null,
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

      if (gqlType.description || gqlType.isDeprecated) {
        interfaceFieldDescriptions[fieldName] = {
          description: gqlType.description,
          deprecated: gqlType.isDeprecated ? gqlType.deprecationReason : null,
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
    generatedSchema[key]['$on'] = {
      __type: `$${key}!`,
    };
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

    if (isNullable) {
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

  let typescriptTypes = sortBy(
    Object.entries(generatedSchema),
    (v) => v[0]
  ).reduce((acum, [typeKey, typeValue]) => {
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
        }; ${Object.entries(typeValue).reduce(
      (acum, [fieldKey, fieldValue]) => {
        if (fieldKey === '__typename') {
          objectTypeMap.set(fieldKey, `?: "${typeName}"`);
          return acum;
        }

        const fieldValueProps = parseSchemaType(fieldValue.__type);
        const typeToReturn = parseFinalType(fieldValueProps);
        let finalType: string;
        if (fieldValue.__args) {
          const argsEntries = Object.entries(fieldValue.__args);
          let onlyNullableArgs = true;
          const argTypes = argsEntries.reduce((acum, [argKey, argValue]) => {
            const argValueProps = parseSchemaType(argValue);
            const connector = argValueProps.isNullable ? '?:' : ':';

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

  const objectTypesEntries = sortBy(
    Array.from(objectTypeTSTypes.entries()),
    (v) => v[0]
  );

  typescriptTypes += `
  export interface SchemaObjectTypes {
    ${objectTypesEntries.reduce((acum, [typeName]) => {
      acum += `${typeName}:${typeName};`;
      return acum;
    }, '')}
  }
  export type SchemaObjectTypesNames = ${objectTypesEntries
    .map(([key]) => `"${key}"`)
    .join(' | ')};
  `;

  if (unionsAndInterfacesObjectTypesMap.size) {
    typescriptTypes += `
    ${sortBy(
      Array.from(unionsAndInterfacesObjectTypesMap.entries()),
      (v) => v[0]
    ).reduce((acum, [unionInterfaceName, objectTypes]) => {
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
    `;

  typescriptTypes += `
    export type MakeNullable<T> = {
      [K in keyof T]: T[K] | undefined;
    };
  
    export interface ScalarsEnums extends MakeNullable<Scalars> {
      ${sortBy(enumsNames).reduce((acum, enumName) => {
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
        : 'const queryFetcher : QueryFetcher'
    } = async function (query, variables) {
        // Modify "${endpoint}" if needed
        const response = await fetch("${endpoint}", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query,
            variables,
          }),
          mode: "cors",
        });
            
        const json = await response.json();
      
        return json;
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

  const generatedSchemaCodeString = sortBy(
    Object.entries(generatedSchema),
    (v) => v[0]
  ).reduceRight(
    (acum, [key, value]) => {
      return `${JSON.stringify(key)}:${JSON.stringify(value)}, ${acum}`;
    },
    hasUnions ? `[SchemaUnionsKey]: ${JSON.stringify(unionsMapObj)}` : ''
  );

  const javascriptSchemaCode = await format(`
/**
 * GQTY AUTO-GENERATED CODE: PLEASE DO NOT MODIFY MANUALLY
 */
${hasUnions ? 'import { SchemaUnionsKey } from "gqty";' : ''}

${typeDoc(
  'import("gqty").ScalarsEnumsHash'
)}export const scalarsEnumsHash = ${scalarsEnumsHashString};

export const generatedSchema = {${generatedSchemaCodeString}};
  `);

  const schemaCode = await format(
    `
/**
 * GQTY AUTO-GENERATED CODE: PLEASE DO NOT MODIFY MANUALLY
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
    `
  );

  let reactClientCode = '';
  if (react) {
    if (isJavascriptOutput) {
      reactClientCode = `
      ${typeDoc(
        'import("@gqty/react").ReactClient<import("./schema.generated").GeneratedSchema>'
      )}const reactClient = createReactClient(client, {
        defaults: {
          // Set this flag as "true" if your usage involves React Suspense
          // Keep in mind that you can overwrite it in a per-hook basis
          suspense: false,
    
          // Set this flag based on your needs
          staleWhileRevalidate: false
        }
      });

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
      } = reactClient;
      `.trim();
    } else {
      reactClientCode = `export const {
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
      } = createReactClient<GeneratedSchema>(client, {
        defaults: {
          // Set this flag as "true" if your usage involves React Suspense
          // Keep in mind that you can overwrite it in a per-hook basis
          suspense: false,
    
          // Set this flag based on your needs
          staleWhileRevalidate: false
        }
      });`;
    }
  }

  const clientCode = await format(
    `
/**
 * GQTY: You can safely modify this file and Query Fetcher based on your needs
 */

  ${react ? `import { createReactClient } from "@gqty/react"` : ''}
  ${
    subscriptions
      ? `import { createSubscriptionsClient } from "@gqty/subscriptions"`
      : ''
  }
  ${isJavascriptOutput ? '' : 'import type { QueryFetcher } from "gqty";'}
  import { createClient } from "gqty";
  ${
    isJavascriptOutput
      ? ''
      : 'import type { GeneratedSchema, SchemaObjectTypes, SchemaObjectTypesNames } from "./schema.generated";'
  }
  import { generatedSchema, scalarsEnumsHash } from "./schema.generated";


  ${queryFetcher}

  ${
    subscriptions
      ? `
  const subscriptionsClient = 
  typeof window !== "undefined" ?
  createSubscriptionsClient({
    wsEndpoint: () => {
      // Modify if needed
      const url = new URL("${endpoint}", window.location.href);
      url.protocol = url.protocol.replace('http', 'ws');
      return url.href;
    }
  }) : undefined;
  `
      : ''
  }

  ${
    isJavascriptOutput
      ? `${typeDoc(
          'import("gqty").GQtyClient<import("./schema.generated").GeneratedSchema>'
        )}export const client = createClient({
        schema: generatedSchema,
        scalarsEnumsHash, 
        queryFetcher
        ${subscriptions ? ', subscriptionsClient' : ''}
      });`
      : `export const client = createClient<GeneratedSchema, SchemaObjectTypesNames, SchemaObjectTypes>({ 
    schema: generatedSchema, 
    scalarsEnumsHash, 
    queryFetcher
    ${subscriptions ? ', subscriptionsClient' : ''}
  });`
  }
  

  export const { query, mutation, mutate, subscription, resolved, refetch, track } = client;

  ${reactClientCode}

  export * from "./schema.generated";
  `
  );
  return {
    clientCode,
    schemaCode,
    javascriptSchemaCode,
    generatedSchema,
    scalarsEnumsHash,
    isJavascriptOutput,
  };
}
