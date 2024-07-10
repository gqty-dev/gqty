import {
  GQtyError,
  type BaseGeneratedSchema,
  type GQtyClient,
  type RetryOptions,
} from 'gqty';
import * as React from 'react';
import type { OnErrorHandler } from '../common';
import type { ReactClientOptionsWithDefaults } from '../utils';

export interface UseMutationOptions<TData> {
  onComplete?: (data: TData) => Promise<void> | void;
  /** @deprecated Use onComplete instead. */
  onCompleted?: (data: TData) => void;
  onError?: OnErrorHandler;
  operationName?: string;
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
   *
   * @deprecated
   */
  refetchQueries?: unknown[];
  /**
   * Await refetch resolutions before calling the mutation actually complete
   *
   * @deprecated
   */
  awaitRefetchQueries?: boolean;
  /** Skip the cache update after a successful fetch. */
  noCache?: boolean;
  /**
   * Activate special handling of non-serializable variables,
   * for example, files uploading
   *
   * @default false
   * @deprecated
   */
  nonSerializableVariables?: boolean;
  /**
   * Enable suspense behavior
   */
  suspense?: boolean;
  /**
   * extension object that allows user to pass custom data to the query fetcher.
   */
  extensions?: Record<string, unknown>;
}

export type UseMutationState = {
  error?: GQtyError;
  isLoading: boolean;
};

export interface UseMutation<TSchema extends BaseGeneratedSchema> {
  <TData, TArgs = never>(
    fn: (mutation: NonNullable<TSchema['mutation']>, args: TArgs) => TData,
    options?: UseMutationOptions<TData>
  ): readonly [
    (options?: { fn?: typeof fn; args: TArgs }) => Promise<TData>,
    UseMutationState & { data?: TData },
  ];
}

export const createUseMutation = <TSchema extends BaseGeneratedSchema>(
  { resolve, refetch }: GQtyClient<TSchema>,
  {
    defaults: { mutationSuspense: defaultSuspense, retry: defaultRetry },
  }: ReactClientOptionsWithDefaults
) => {
  const useMutation: UseMutation<TSchema> = <TData, TArgs = never>(
    mutationFn: (
      mutation: NonNullable<TSchema['mutation']>,
      args: TArgs
    ) => TData,
    {
      onCompleted,
      onComplete = onCompleted,
      onError,
      retry = defaultRetry,
      refetchQueries = [],
      awaitRefetchQueries,
      suspense = defaultSuspense,
      noCache = false,
      extensions,
    }: UseMutationOptions<ReturnType<typeof mutationFn>> = {}
  ) => {
    const [state, setState] = React.useState<{
      data?: TData;
      error?: GQtyError;
      promise?: Promise<TData>;
    }>({});

    if (suspense) {
      if (state.promise) throw state.promise;
      if (state.error) throw state.error;
    }

    const mutate = React.useCallback(
      async ({
        fn = mutationFn,
        args,
      }: { fn?: typeof mutationFn; args?: TArgs } = {}) => {
        if (!fn) {
          throw new GQtyError(`Please specify a mutation function.`);
        }

        try {
          const promise = resolve(
            ({ mutation }) => {
              if (mutation === undefined) {
                throw new GQtyError(`Mutation is not defined in the schema.`);
              }

              return fn(mutation, args as TArgs);
            },
            {
              cachePolicy: noCache ? 'no-store' : 'no-cache',
              retryPolicy: retry,
              extensions,
            }
          ).then((data) => {
            const refetches = refetchQueries.map((v) => refetch(v));

            return awaitRefetchQueries
              ? Promise.all(refetches).then(() => data)
              : data;
          }) as Promise<TData>;

          setState({ promise });

          const data = await promise;

          await onComplete?.(data);
          setState({ data });

          return data;
        } catch (e) {
          const error = GQtyError.create(e);

          onError?.(error);
          setState({ error });

          throw error;
        }
      },
      [mutationFn, noCache, retry, refetchQueries, awaitRefetchQueries]
    );

    return Object.freeze([
      mutate,
      Object.freeze({
        data: state.data,
        error: state.error,
        isLoading: state.promise !== undefined,
      }),
    ]);
  };

  return useMutation;
};
