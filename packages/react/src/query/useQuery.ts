import { GQtyClient, GQtyError, prepass, SelectionType } from 'gqty';
import * as React from 'react';

import {
  OnErrorHandler,
  useForceUpdate,
  useInterceptSelections,
  useIsomorphicLayoutEffect,
} from '../common';
import type { ReactClientOptionsWithDefaults } from '../utils';

export interface UseQueryPrepareHelpers<
  GeneratedSchema extends {
    query: object;
  }
> {
  readonly prepass: typeof prepass;
  readonly query: GeneratedSchema['query'];
}
export interface UseQueryOptions<
  GeneratedSchema extends {
    query: object;
  } = never
> {
  suspense?: boolean;
  staleWhileRevalidate?: boolean | object | number | string | null;
  onError?: OnErrorHandler;
  prepare?: (helpers: UseQueryPrepareHelpers<GeneratedSchema>) => void;
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
    $refetch: () => Promise<void> | void;
  };
export interface UseQuery<GeneratedSchema extends { query: object }> {
  (
    options?: UseQueryOptions<GeneratedSchema>
  ): UseQueryReturnValue<GeneratedSchema>;
}

export function createUseQuery<
  GeneratedSchema extends {
    query: object;
    mutation: object;
    subscription: object;
  }
>(
  {
    scheduler,
    eventHandler,
    interceptorManager,
    query,
    buildAndFetchSelections,
  }: GQtyClient<GeneratedSchema>,
  {
    defaults: {
      suspense: defaultSuspense,
      staleWhileRevalidate: defaultStaleWhileRevalidate,
    },
  }: ReactClientOptionsWithDefaults
) {
  const errorsMap = scheduler.errors.map;
  const getLastError = () => Array.from(errorsMap.values()).pop();
  const prepareHelpers: UseQueryPrepareHelpers<GeneratedSchema> = {
    prepass,
    query,
  };

  const useQuery: UseQuery<GeneratedSchema> = function useQuery({
    suspense = defaultSuspense,
    staleWhileRevalidate = defaultStaleWhileRevalidate,
    onError,
    prepare,
  }: UseQueryOptions<GeneratedSchema> = {}): UseQueryReturnValue<GeneratedSchema> {
    const [$state] = React.useState(
      (): Writeable<UseQueryState> => ({
        get isLoading() {
          return fetchingPromise.current !== null;
        },
        error: getLastError(),
      })
    );
    const { fetchingPromise, selections } = useInterceptSelections({
      staleWhileRevalidate,
      eventHandler,
      interceptorManager,
      scheduler,
      onError,
      updateOnFetchPromise: true,
    });

    if (prepare) {
      try {
        prepare(prepareHelpers);
      } catch (err) {
        if (err instanceof Error && Error.captureStackTrace!) {
          Error.captureStackTrace(err, useQuery);
        }
        throw err;
      }
    }

    useIsomorphicLayoutEffect(
      () =>
        scheduler.errors.subscribeErrors((ev) => {
          switch (ev.type) {
            case 'errors_clean':
            case 'new_error': {
              $state.error = getLastError();
            }
          }
        }),
      []
    );

    if (fetchingPromise.current && suspense) {
      throw fetchingPromise.current;
    }

    const forceUpdate = useForceUpdate();

    return React.useMemo(() => {
      return new Proxy<UseQueryReturnValue<GeneratedSchema>>(
        {
          $state,
          $refetch: async () => {
            fetchingPromise.current = buildAndFetchSelections(
              Array.from(selections).filter(
                (v) => v.type === SelectionType.Query
              ),
              'query'
            );
            forceUpdate();

            await fetchingPromise.current;
            fetchingPromise.current = null;
            forceUpdate();
          },
        },
        {
          set(_, key, value) {
            return Reflect.set(query, key, value);
          },
          get(target, key) {
            return Reflect.get(target, key) ?? Reflect.get(query, key);
          },
        }
      );
    }, [$state]);
  };

  return useQuery;
}
