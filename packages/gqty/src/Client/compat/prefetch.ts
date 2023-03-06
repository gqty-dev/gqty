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
    const { accessor, context, resolve } = createResolver({
      operationName,
    });
    const unsubscribe = subscribeLegacySelections((selection, cache) => {
      context.onSelect?.(selection, cache);
    });
    const data = fn(accessor.query);

    unsubscribe();

    if (!context.shouldFetch) {
      return data;
    }

    return resolve().then(() => fn(accessor.query));
  };
