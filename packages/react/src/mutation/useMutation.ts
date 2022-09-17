import { doRetry, GQtyClient, GQtyError, RetryOptions } from 'gqty';
import * as React from 'react';

import {
  OnErrorHandler,
  useDeferDispatch,
  useSuspensePromise,
} from '../common';
import type { ReactClientOptionsWithDefaults } from '../utils';

export interface UseMutationOptions<TData> {
  noCache?: boolean;
  onCompleted?: (data: TData) => void;
  onError?: OnErrorHandler;
  /**
   * Retry behaviour
   *
   * @default false
   */
  retry?: RetryOptions;
  /**
   * Refetch specific queries after mutation completion.
   *
   * You can give functions or parts of the schema to be refetched
   */
  refetchQueries?: unknown[];
  /**
   * Await refetch resolutions before calling the mutation actually complete
   */
  awaitRefetchQueries?: boolean;
  /**
   * Enable suspense behavior
   */
  suspense?: boolean;
  /**
   * Activate special handling of non-serializable variables,
   * for example, files uploading
   *
   * @default false
   */
  nonSerializableVariables?: boolean;
}

export interface UseMutationState<TData> {
  data: TData | undefined;
  error?: GQtyError;
  isLoading: boolean;
}

type UseMutationReducerAction<TData> =
  | { type: 'success'; data: TData }
  | { type: 'failure'; error: GQtyError }
  | { type: 'loading' };

function UseMutationReducer<TData>(
  state: UseMutationState<TData>,
  action: UseMutationReducerAction<TData>
): UseMutationState<TData> {
  switch (action.type) {
    case 'loading': {
      if (state.isLoading) return state;
      return {
        data: state.data,
        isLoading: true,
      };
    }
    case 'success': {
      return {
        data: action.data,
        isLoading: false,
      };
    }
    case 'failure': {
      return {
        data: state.data,
        isLoading: false,
        error: action.error,
      };
    }
  }
}

function InitUseMutationReducer<TData>(): UseMutationState<TData> {
  return {
    data: undefined,
    isLoading: false,
  };
}

export interface UseMutation<
  GeneratedSchema extends {
    mutation: object;
  }
> {
  <TData = unknown, TArgs = undefined>(
    mutationFn?: (mutation: GeneratedSchema['mutation'], args: TArgs) => TData,
    options?: UseMutationOptions<TData>
  ): readonly [
    (
      ...opts: undefined extends TArgs
        ? [
            {
              fn?: (
                mutation: GeneratedSchema['mutation'],
                args: TArgs
              ) => TData;
              args?: TArgs;
            }?
          ]
        : [
            {
              fn?: (
                mutation: GeneratedSchema['mutation'],
                args: TArgs
              ) => TData;
              args: TArgs;
            }
          ]
    ) => Promise<TData>,
    UseMutationState<TData>
  ];
}

export function createUseMutation<
  GeneratedSchema extends {
    mutation: object;
    query: object;
    subscription: object;
  }
>(
  client: GQtyClient<GeneratedSchema>,
  {
    defaults: { mutationSuspense: defaultSuspense },
  }: ReactClientOptionsWithDefaults
) {
  const { resolved, refetch } = client;
  const clientMutation: GeneratedSchema['mutation'] = client.mutation;

  const useMutation: UseMutation<GeneratedSchema> = function useMutation<
    TData,
    TArgs = undefined
  >(
    mutationFn?: (mutation: typeof clientMutation, args: TArgs) => TData,
    opts: UseMutationOptions<TData> = {}
  ): readonly [
    ({
      fn,
      args,
    }?: {
      fn?: (mutation: GeneratedSchema['mutation'], args: TArgs) => TData;
      args?: TArgs;
    }) => Promise<TData>,
    UseMutationState<TData>
  ] {
    const optsRef = React.useRef(opts);
    optsRef.current = Object.assign({}, opts);
    optsRef.current.suspense ??= defaultSuspense;

    const setSuspensePromise = useSuspensePromise(optsRef);

    const [state, dispatchReducer] = React.useReducer(
      UseMutationReducer,
      undefined,
      InitUseMutationReducer
    ) as [
      UseMutationState<TData>,
      React.Dispatch<UseMutationReducerAction<TData>>
    ];
    const dispatch = useDeferDispatch(dispatchReducer);

    const fnRef = React.useRef(mutationFn);
    fnRef.current = mutationFn;

    const callRefetchQueries =
      React.useCallback((): Promise<unknown> | void => {
        const { refetchQueries, awaitRefetchQueries } = optsRef.current;

        if (refetchQueries?.length) {
          const refetchPromise = Promise.all(
            refetchQueries.map((v) => refetch(v))
          ).catch((err) => {
            dispatch({
              type: 'failure',
              error: GQtyError.create(err, useMutation),
            });
          });

          if (awaitRefetchQueries) return refetchPromise;
        }
      }, [optsRef, dispatch]);

    const mutate = React.useCallback(
      function mutateFn({
        fn: fnArg,
        args,
      }: { fn?: typeof mutationFn; args?: any } = {}) {
        dispatch({ type: 'loading' });

        const refFn = fnRef.current;

        const functionResolve = fnArg
          ? () => fnArg(clientMutation, args)
          : refFn
          ? () => refFn(clientMutation, args)
          : (() => {
              throw new GQtyError(
                'You have to specify a function to be resolved',
                {
                  caller: mutateFn,
                }
              );
            })();

        return resolved<TData>(functionResolve, {
          noCache: optsRef.current.noCache,
          refetch: true,
          nonSerializableVariables: optsRef.current.nonSerializableVariables,
        }).then(
          async (data) => {
            const refetchingQueries = callRefetchQueries();
            if (refetchingQueries) await refetchingQueries;

            optsRef.current.onCompleted?.(data);
            dispatch({
              type: 'success',
              data,
            });

            return data;
          },
          (err: unknown) => {
            const error = GQtyError.create(err, useMutation);
            optsRef.current.onError?.(error);
            dispatch({
              type: 'failure',
              error,
            });

            throw error;
          }
        );
      },
      [optsRef, fnRef, dispatch, callRefetchQueries]
    );

    const { retry = false } = opts;

    return React.useMemo(() => {
      const fn: typeof mutate = retry
        ? (...args: any[]) => {
            const promise = mutate(...args).catch((err) => {
              doRetry(retry, {
                onRetry: () => {
                  const promise = mutate(...args).then(() => {});

                  setSuspensePromise(promise);

                  return promise;
                },
              });

              throw err;
            });

            setSuspensePromise(promise);

            return promise;
          }
        : mutate;

      return [fn, state];
    }, [state, mutate, retry, optsRef, setSuspensePromise]);
  };

  return useMutation;
}
