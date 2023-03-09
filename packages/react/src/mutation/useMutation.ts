import { BaseGeneratedSchema, GQtyClient, GQtyError, RetryOptions } from 'gqty';
import * as React from 'react';
import type { OnErrorHandler } from '../common';
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
   * @deprecated
   */
  nonSerializableVariables?: boolean;
}

export interface UseMutationState<TData> {
  data: TData | undefined;
  error?: GQtyError;
  isLoading: boolean;
}

export interface UseMutation<TSchema extends BaseGeneratedSchema> {
  <TData, TArgs = never>(
    mutationFn?: (
      mutation: NonNullable<TSchema['mutation']>,
      args: TArgs
    ) => TData,
    options?: UseMutationOptions<TData>
  ): readonly [
    (options?: { fn?: typeof mutationFn; args: TArgs }) => Promise<TData>,
    UseMutationState<TData>
  ];
}

export const createUseMutation = <TSchema extends BaseGeneratedSchema>(
  { resolve, refetch }: GQtyClient<TSchema>,
  {
    defaults: { mutationSuspense: defaultSuspense, retry: defaultRetry },
  }: ReactClientOptionsWithDefaults
) => {
  const useMutation: UseMutation<TSchema> = (
    mutationFn,
    {
      onCompleted,
      onError,
      retry = defaultRetry,
      refetchQueries = [],
      awaitRefetchQueries,
      suspense = defaultSuspense,
      noCache = false,
    } = {}
  ) => {
    type TCallback = typeof mutationFn;
    type TData = ReturnType<Exclude<TCallback, undefined>>;
    type TArgs = TCallback extends undefined
      ? undefined
      : Parameters<Exclude<TCallback, undefined>>[1];

    const [data, setData] = React.useState<TData>();
    const [error, setError] = React.useState<GQtyError>();
    const [fetchPromise, setFetchPromise] = React.useState<Promise<TData>>();

    if (suspense) {
      if (fetchPromise) throw fetchPromise;
      if (error) throw error;
    }

    const mutate = React.useCallback(
      async ({
        fn = mutationFn,
        args,
      }: { fn?: TCallback; args?: TArgs } = {}) => {
        if (!fn) {
          throw new GQtyError(`Please specify a mutation function.`);
        }

        setError(undefined);

        const promise = resolve(
          ({ mutation }) => {
            if (mutation === undefined) {
              throw new GQtyError(`Mutation is not defined in the schema.`);
            }

            return fn(mutation, args as TArgs);
          },
          {
            fetchPolicy: noCache ? 'no-store' : 'no-cache',
            retryPolicy: retry,
          }
        ).then((data) => {
          const refetchPromise = Promise.all(
            refetchQueries.map((v) => refetch(v))
          );

          return awaitRefetchQueries ? refetchPromise.then(() => data) : data;
        }) as Promise<TData>;

        setFetchPromise(promise);

        try {
          const data = await promise;

          const refetchPromise = Promise.all(
            refetchQueries.map((v) => refetch(v))
          );

          if (awaitRefetchQueries) {
            await refetchPromise;
          }

          onCompleted?.(data);
          setData(data);

          return data;
        } catch (error) {
          const theError = GQtyError.create(error);

          onError?.(theError);
          setError(theError);

          throw theError;
        } finally {
          setFetchPromise(undefined);
        }
      },
      [mutationFn, noCache, retry, refetchQueries, awaitRefetchQueries]
    );

    return Object.freeze([mutate, { data, error, isLoading: !!fetchPromise }]);
  };

  return useMutation;
};
