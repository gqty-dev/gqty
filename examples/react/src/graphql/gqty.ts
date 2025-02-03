/**
 * This generated client is deliberately left untouched after new core to serve
 * as a testing point for backwards compatibility.
 */

import { createSubscriptionsClient } from '@gqty/subscriptions';
import extractFiles from 'extract-files/extractFiles.mjs';
import isExtractableFile from 'extract-files/isExtractableFile.mjs';
import {
  Cache,
  createClient,
  defaultResponseHandler,
  LegacyQueryFetcher as QueryFetcher,
} from 'gqty';
import {
  GeneratedSchema,
  generatedSchema,
  scalarsEnumsHash,
} from './schema.generated';

const queryFetcher: QueryFetcher = async function (query, variables) {
  const endpoint =
    typeof window === 'undefined'
      ? `http://0.0.0.0:3000/api/graphql`
      : '/api/graphql';

  const { files, clone } = extractFiles(
    { query, variables },
    isExtractableFile
  );

  if (files.size > 0) {
    const formData = new FormData();

    formData.append('operations', JSON.stringify(clone));
    formData.append(
      'map',
      JSON.stringify(
        [...files.values()].reduce(
          (prev, paths, i) => {
            prev[i + 1] = paths;
            return prev;
          },
          {} as Record<number, string[]>
        )
      )
    );

    let i = 0;
    for (const [file] of files) {
      formData.append(`${++i}`, file as File);
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      mode: 'cors',
    });

    return await defaultResponseHandler(response);
  } else {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
      mode: 'cors',
    });

    return await defaultResponseHandler(response);
  }
};

const subscriptionsClient =
  typeof window === 'undefined'
    ? undefined
    : createSubscriptionsClient({
        wsEndpoint: () => {
          // Modify if needed
          const url = new URL('/api/graphql', window.location.href);
          url.protocol = url.protocol.replace('http', 'ws');

          console.log(42, url.href);
          return url.href;
        },
      });

export const cache = new Cache(undefined, {
  maxAge: 1000,
  staleWhileRevalidate: 60 * 5000,
  normalization: true,
});

export const client = createClient<GeneratedSchema>({
  cache,
  schema: generatedSchema,
  scalarsEnumsHash,
  queryFetcher,
  subscriptionsClient,
});

const { query, mutation, mutate, subscription, resolved, refetch, track } =
  client;

export * from './schema.generated';
export { mutate, mutation, query, refetch, resolved, subscription, track };
