import type { GraphQLError } from 'graphql';
import extend from 'just-extend';
import type { Cache, CacheObject, CacheRoot, CacheSetOptions } from '../Cache';
import { GQtyError } from '../Error';
import type { FetchResult } from './resolveSelections';

export const updateCaches = <TData extends Record<string, unknown>>(
  results: FetchResult<TData>[],
  caches: Cache[],
  cacheSetOptions?: CacheSetOptions
) => {
  const errorSet = new Set<GraphQLError>();

  for (const response of results) {
    const { data, error, extensions } = response;
    const type = extensions?.type;

    if (!type || typeof type !== 'string') {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[GQty] Missing extensions.type in query result.');
      }

      continue;
    }

    if (data !== undefined) {
      const newValues = {
        [type]: extend(true, {}, data) as CacheObject,
      } as CacheRoot;

      for (const cache of caches) {
        cache.set(newValues, cacheSetOptions);
      }
    }

    if (error) {
      if (!(error instanceof GQtyError) || !error.graphQLErrors?.length) {
        throw error;
      } else {
        error.graphQLErrors.forEach((error) => errorSet.add(error));
      }
    }
  }

  if (errorSet.size) {
    throw GQtyError.fromGraphQLErrors([...errorSet]);
  }
};
