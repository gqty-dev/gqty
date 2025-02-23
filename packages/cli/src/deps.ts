export { program } from '@commander-js/extra-typings';
export { codegen } from '@graphql-codegen/core';
export * as typescriptPlugin from '@graphql-codegen/typescript';
export { printSchemaWithDirectives } from '@graphql-tools/utils';
export { schemaFromExecutor, wrapSchema } from '@graphql-tools/wrap';
export * as inquirer from '@inquirer/prompts';
export { cosmiconfig, type Loader } from 'cosmiconfig';
export { fetch } from 'cross-fetch';
export { default as fg } from 'fast-glob';
export { buildSchema, printSchema } from 'graphql';
export { default as prettier, type Options as PrettierOptions } from 'prettier';

export function sortBy(
  key: string
): <T extends Record<string, unknown>>(a: T, b: T) => number;
export function sortBy(
  key: number
): <T extends Array<unknown>>(a: T, b: T) => number;
export function sortBy(key: string | number) {
  return (a: any, b: any) => (a[key] > b[key] ? 1 : b[key] > a[key] ? -1 : 0);
}
