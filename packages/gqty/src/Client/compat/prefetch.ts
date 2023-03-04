import type { BaseGeneratedSchema } from '../..';
import { GQtyError } from '../../Error';
import type { Selection } from '../../Selection';
import { fetchSelections } from '../resolveSelections';
import { updateCaches } from '../updateCaches';
import type { CreateLegacyMethodOptions } from './client';

export type LegacyPrefetch<TSchema extends BaseGeneratedSchema> = {
  <TData>(fn: (query: TSchema['query']) => TData): TData | Promise<TData>;
};

export const createLegacyPrefetch = <
  TSchema extends BaseGeneratedSchema = BaseGeneratedSchema
>({
  accessor,
  cache,
  fetchOptions: { fetcher, retryPolicy, subscriber, ...fetchOptions },
  subscribeLegacySelections: subscribeSelections,
}: CreateLegacyMethodOptions<TSchema>): LegacyPrefetch<TSchema> => {
  return (fn, { operationName }: { operationName?: string } = {}) => {
    let shouldFetch = false;
    const selections = new Set<Selection>();
    const unsubscribe = subscribeSelections((selection, cache) => {
      shouldFetch ||= cache?.data === undefined;

      selections.add(selection);
    });

    const data = fn(accessor.query);

    unsubscribe();

    if (!shouldFetch) {
      return data;
    }

    return fetchSelections(selections, {
      fetchOptions: { fetcher, retryPolicy, ...fetchOptions },
      operationName,
    }).then(
      (results) => {
        updateCaches(results, [cache]);

        return fn(accessor.query);
      },
      (error) => Promise.reject(GQtyError.create(error, () => {}))
    );
  };
};
