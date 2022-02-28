import type { ExecutionResult } from 'graphql';

export interface Type {
  __args?: Record<string, string>;
  __type: string;
}

export const SchemaUnionsKey = Symbol('unionsKey');
export interface Schema extends Record<string, Record<string, Type>> {
  query: Record<string, Type>;
  mutation: Record<string, Type>;
  subscription: Record<string, Type>;
  [SchemaUnionsKey]?: Record<string, readonly string[]>;
}

export interface Scalars {
  String: string;
  Int: number;
  Float: number;
  ID: string;
}

export type ScalarsEnumsHash = Record<string, true>;

export interface FetchOptions extends Omit<RequestInit, 'body'> {}

export type QueryFetcher = (
  query: string,
  variables: Record<string, any> | undefined,
  fetchOptions?: FetchOptions
) => Promise<ExecutionResult> | ExecutionResult;

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

export function parseSchemaType(type: string, fieldDesc: FieldDescription | undefined = undefined): ParseSchemaTypeInfo {
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

export type DeepPartial<T> = T extends Function
  ? T
  : T extends Array<infer U>
  ? _DeepPartialArray<U>
  : T extends object
  ? _DeepPartialObject<T>
  : T | undefined;

interface _DeepPartialArray<T> extends Array<DeepPartial<T>> {}
type _DeepPartialObject<T> = { [P in keyof T]?: DeepPartial<T[P]> };
