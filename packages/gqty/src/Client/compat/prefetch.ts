import type { BaseGeneratedSchema } from '../..';
import type { CreateLegacyMethodOptions } from './client';

export type LegacyPrefetch<TSchema extends BaseGeneratedSchema> = {
  <TData>(fn: (query: TSchema['query']) => TData): TData | Promise<TData>;
};

export const createLegacyPrefetch =
  <TSchema extends BaseGeneratedSchema = BaseGeneratedSchema>({
    resolvers: { createResolver },
    subscribeLegacySelections,
  }: CreateLegacyMethodOptions<TSchema>): LegacyPrefetch<TSchema> =>
  (fn, { operationName }: { operationName?: string } = {}) => {
    const {
      accessor: { query },
      context,
      resolve,
    } = createResolver({ operationName });
    const unsubscribe = subscribeLegacySelections((selection, cache) => {
      context.select(selection, cache);
    });
    const data = fn(query);

    unsubscribe();

    if (!context.shouldFetch) {
      return data;
    }

    return resolve().then(() => fn(query));
  };
