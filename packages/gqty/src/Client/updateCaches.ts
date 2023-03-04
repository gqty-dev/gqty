import type { GraphQLError } from 'graphql';
import type { Cache, CacheObject, CacheRoot, CacheSetOptions } from '../Cache';
import { GQtyError } from '../Error';
import type { FetchResult } from './resolveSelections';

export const updateCaches = <TData extends Record<string, unknown>>(
  results: FetchResult<TData>[],
  caches: Cache[],
  cacheSetOptions?: CacheSetOptions
) => {
  const errorSet = new Set<GraphQLError>();

  for (const { data, errors, extensions } of results) {
    const type = `${extensions?.type}`;

    if (data !== undefined) {
      const newValues = { [type]: data as CacheObject } as CacheRoot;

      for (const cache of caches) {
        cache.set(newValues, cacheSetOptions);
      }
    }

    errors?.forEach((error) => errorSet.add(error));
  }

  if (errorSet.size) {
    throw GQtyError.fromGraphQLErrors([...errorSet]);
  }
};
