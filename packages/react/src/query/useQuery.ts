import { useRerender } from '@react-hookz/web';
import {
  BaseGeneratedSchema,
  GQtyClient,
  GQtyError,
  prepass,
  RetryOptions,
} from 'gqty';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { OnErrorHandler } from '../common';
import { useWindowFocusEffect } from '../useWindowFocusEffect';
import type { ReactClientOptionsWithDefaults } from '../utils';

export interface UseQueryPrepareHelpers<
  GeneratedSchema extends {
    query: object;
  }
> {
  readonly prepass: typeof prepass;
  readonly query: GeneratedSchema['query'];
}
export interface UseQueryOptions<TSchema extends BaseGeneratedSchema> {
  onError?: OnErrorHandler;
  operationName?: string;
  prepare?: (helpers: UseQueryPrepareHelpers<TSchema>) => void;
  refetchOnWindowVisible?: boolean;
  retry?: RetryOptions;
  staleWhileRevalidate?: boolean | object | number | string | null;
  suspense?: boolean;
}

export interface UseQueryState {
  /**
   * Useful for `Non-Suspense` usage.
   */
  readonly isLoading: boolean;

  /**
   * Latest scheduler Error, for more in-depth error management use `useMetaState` hook
   */
  error?: GQtyError;
}

export type Writeable<T> = { -readonly [P in keyof T]: T[P] };

export type UseQueryReturnValue<GeneratedSchema extends { query: object }> =
  GeneratedSchema['query'] & {
    $state: UseQueryState;
    $refetch: () => Promise<unknown> | void;
  };
export interface UseQuery<GeneratedSchema extends { query: object }> {
  (
    options?: UseQueryOptions<GeneratedSchema>
  ): UseQueryReturnValue<GeneratedSchema>;
}

export const createUseQuery =
  <TSchema extends BaseGeneratedSchema>(
    client: GQtyClient<TSchema>,
    {
      defaults: {
        suspense: defaultSuspense,
        staleWhileRevalidate: defaultStaleWhileRevalidate,
        retry: defaultRetry,
      },
    }: ReactClientOptionsWithDefaults
  ): UseQuery<TSchema> =>
  ({
    onError,
    operationName,
    prepare,
    refetchOnWindowVisible = false,
    retry = defaultRetry,
    staleWhileRevalidate = defaultStaleWhileRevalidate,
    suspense = defaultSuspense,
  } = {}) => {
    const { accessor, context, resolve, selections } = useMemo(
      () => client.createResolver({ operationName, retryPolicy: retry }),
      [operationName, retry]
    );
    const [error, setError] = useState<GQtyError>();
    const [fetchPromise, setFetchPromise] = useState<Promise<unknown>>();

    if (suspense) {
      if (error) throw error;
      if (fetchPromise) throw fetchPromise;
    }

    // Reset these, or createResolver() each time and deal with the new resolve.
    context.shouldFetch = false;
    context.hasCacheHit = false;
    context.hasCacheMiss = false;

    if (prepare) {
      // TODO: See if `Error.captureStackTrace(error, useQuery);` is needed
      prepare({ prepass, query: accessor.query });

      // Assuming the fetch always fulfills selections in prepare(), otherwise
      // this may cause an infinite render loop.
      if (suspense && context.shouldFetch) {
        throw resolve();
      }
    }

    const fetchQuery = useCallback(async () => {
      setError(undefined);

      const fetchPromise = resolve();
      setFetchPromise(fetchPromise);

      try {
        await fetchPromise;
      } catch (error) {
        const theError = GQtyError.create(error);

        onError?.(theError);

        if (suspense) throw theError;

        setError(theError);
      } finally {
        setFetchPromise(undefined);
      }
    }, [onError, resolve]);

    {
      // Invoke it on client side automatically.
      useEffect(() => {
        fetchQuery();
      }, [fetchQuery]);
    }

    // staleWhileRevalidate
    useEffect(() => {
      $refetch();
    }, [staleWhileRevalidate]);

    {
      const render = useRerender();

      // A rerender should be enough to trigger a soft check, fetch will
      // happen if any of the accessed cache value is stale.
      useWindowFocusEffect(render, { enabled: refetchOnWindowVisible });

      // Re-renders on cache changes from others
      useEffect(
        () =>
          context.cache.subscribe(
            [...selections].map(({ cacheKeys }) => cacheKeys.join('.')),
            render
          ),
        [selections, selections.size]
      );
    }

    const $refetch = useCallback(() => {
      const prevShouldFetch = context.shouldFetch;
      context.shouldFetch = true;
      const promise = fetchQuery();
      context.shouldFetch = prevShouldFetch;

      return promise;
    }, [fetchQuery]);

    const $state = {
      isLoading: fetchPromise !== undefined,
      error,
    };

    return { ...accessor, $refetch, $state };
  };
