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
  startWatching: () => void;
  stopWatching: () => void;
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
    startWatching = true,
    retry = defaultRetry,
    suspense = false,
  } = {}) => {
    const [state, setState] = React.useState<{
      error?: GQtyError;
      promise?: Promise<unknown>;
    }>();
    const watchingRef = React.useRef(startWatching);
    const [selections] = React.useState(() => new Set<Selection>());

    // All selections from this component down the rendering tree, this almost
    // 100% guaranteed to be more than necessary as a refetch. This is necessary
    // as long as useRefetch() exists as a separate hook, and accepts no
    // parameters as one of the overloads. React provides no way to identify a
    // component and potentially gain access to the SchemaContext from other
    // query hooks.
    const [unsubscribeSelections] = React.useState(() =>
      client.subscribeLegacySelections((selection) => {
        if (watchingRef.current && selection.root.key === 'query') {
          selections.add(selection);
        }
      })
    );
    React.useEffect(() => unsubscribeSelections, [unsubscribeSelections]);

    if (suspense) {
      if (state?.promise) throw state?.promise;
      if (state?.error) throw state?.error;
    }

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
            context.select(selection);
          });

          return resolve() as Promise<T>;
        })();

        setState({ promise });

        try {
          return (await promise) as T;
        } catch (error) {
          const theError = GQtyError.create(error);
          setState({ error: theError });
          throw theError;
        }
      },
      [notifyOnNetworkStatusChange, operationName, retry]
    );

    return React.useMemo(
      () =>
        Object.assign(refetch, {
          isLoading: state?.promise !== undefined,
          error: state?.error,
          startWatching: () => {
            watchingRef.current = true;
          },
          stopWatching: () => {
            watchingRef.current = false;
          },
        }),
      []
    );
  };

  return useRefetch;
};
