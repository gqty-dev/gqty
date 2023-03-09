import {
  BaseGeneratedSchema,
  GQtyClient,
  GQtyError,
  RetryOptions,
  Selection,
} from 'gqty';
import * as React from 'react';
import type { ReactClientOptionsWithDefaults } from '../utils';

interface UseRefetchState {
  isLoading: boolean;
  error?: GQtyError;
}

export interface UseRefetchOptions {
  notifyOnNetworkStatusChange?: boolean;
  operationName?: string;
  retry?: RetryOptions;
  startWatching?: boolean;
  suspense?: boolean;
}

export interface UseRefetch<TSchema extends BaseGeneratedSchema> {
  (refetchOptions?: UseRefetchOptions): (<T = void>(
    refetchArg?: T | ((query: TSchema['query']) => T)
  ) => Promise<T | undefined>) &
    UseRefetchState;
}

export const createUseRefetch = <TSchema extends BaseGeneratedSchema>(
  client: GQtyClient<TSchema>,
  { defaults: { retry: defaultRetry } }: ReactClientOptionsWithDefaults
) => {
  const useRefetch: UseRefetch<TSchema> = ({
    notifyOnNetworkStatusChange = true,
    operationName,
    // startWatching = true, // With scoped query, this is no longer necessary.
    retry = defaultRetry,
    suspense = false,
  } = {}) => {
    const [fetchPromise, setFetchPromise] = React.useState<Promise<unknown>>();
    const [error, setError] = React.useState<GQtyError>();

    if (suspense) {
      if (fetchPromise) throw fetchPromise;
      if (error) throw error;
    }

    const [selections] = React.useState(() => new Set<Selection>());

    // All selections from this component down the rendering tree, this almost
    // 100% guaranteed to be more than necessary as a refetch. This is necessary
    // as long as useRefetch() exists as a separate hook, and accepts no
    // parameters as one of the overloads. React provides no way to identify a
    // component and potentially gain access to the SchemaContext from other
    // query hooks.
    React.useEffect(
      () =>
        client.subscribeLegacySelections((selection) => {
          selections.add(selection);
        }),
      []
    );

    const refetch = React.useCallback(
      async <T = void>(
        fnArg?: T | ((query: TSchema['query']) => T)
      ): Promise<T | undefined> => {
        const promise = (() => {
          if (fnArg) return client.refetch(fnArg);

          const { context, resolve } = client.createResolver({
            retryPolicy: retry,
            operationName,
          });

          selections.forEach((selection) => {
            context.onSelect?.(selection);
          });

          return resolve() as Promise<T>;
        })();

        setFetchPromise(promise);

        try {
          return (await promise) as T;
        } catch (error) {
          const theError = GQtyError.create(error);
          setError(theError);
          throw theError;
        }
      },
      [notifyOnNetworkStatusChange, operationName, retry]
    );

    return React.useMemo(
      () =>
        Object.assign(refetch, {
          isLoading: fetchPromise !== undefined,
          error,
        }),
      []
    );
  };

  return useRefetch;
};
