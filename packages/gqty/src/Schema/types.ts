import type { ExecutionResult } from 'graphql';
import memoize from 'just-memoize';

export interface Type {
  __args?: Record<string, string>;
  __type: string;
}

export const SchemaUnionsKey = Symbol('unionsKey');
export interface Schema
  extends Record<string, Record<string, Type> | undefined> {
  query: Record<string, Type>;
  mutation?: Record<string, Type>;
  subscription?: Record<string, Type>;
  [SchemaUnionsKey]?: Record<string, readonly string[]>;
}

export interface Scalars {
  String: string;
  Int: number;
  Float: number;
  ID: string;
}

export type ScalarsEnumsHash = Record<string, true>;

export type QueryFetcher<TData = Record<string, unknown>> = (
  payload: QueryPayload,
  fetchOptions?: Omit<RequestInit, 'body' | 'mode'>
) => Promise<ExecutionResult<TData>> | ExecutionResult<TData>;

export type QueryPayload<
  TExtension extends Record<string, unknown> = Record<string, unknown>
> = {
  readonly query: string;
  readonly variables?: Record<string, unknown>;
  readonly operationName?: string;
  readonly extensions?: TExtension;
};

export interface ParseSchemaTypeInfo {
  pureType: string;
  isNullable: boolean;
  hasDefaultValue: boolean;
  isArray: boolean;
  nullableItems: boolean;
}

export interface FieldDescription {
  description?: string | null;
  deprecated?: string | null;
  defaultValue?: string | null;
}

export type ArgsDescriptions = Record<
  string,
  Record<string, FieldDescription | undefined>
>;

export const parseSchemaType = memoize(
  (
    type: string,
    fieldDesc: FieldDescription | undefined = undefined
  ): ParseSchemaTypeInfo => {
    let isArray = false;
    let isNullable = true;
    let hasDefaultValue = !!(fieldDesc && fieldDesc.defaultValue !== null);
    let pureType = type;
    let nullableItems = true;
    if (pureType.endsWith('!')) {
      isNullable = false;
      pureType = pureType.slice(0, pureType.length - 1);
    }

    if (pureType.startsWith('[')) {
      pureType = pureType.slice(1, pureType.length - 1);
      isArray = true;
      if (pureType.endsWith('!')) {
        nullableItems = false;
        pureType = pureType.slice(0, pureType.length - 1);
      }
    }

    return {
      pureType,
      isNullable,
      hasDefaultValue,
      isArray,
      nullableItems,
    };
  }
);

export type GeneratedSchemaObject<
  T extends Record<string, any> = Record<string, any>
> = T & {
  __typename?: string;
};
