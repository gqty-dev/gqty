import { BaseGeneratedSchema, GQtyClient, GQtyError, RetryOptions } from 'gqty';
import * as React from 'react';
import type { OnErrorHandler } from '../common';
import { useSafeRender } from '../useSafeRender';
import type { ReactClientOptionsWithDefaults } from '../utils';

export interface UseMutationOptions<TData> {
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
}

export type UseMutationState = {
  error?: GQtyError;
  isLoading: boolean;
};

export interface UseMutation<TSchema extends BaseGeneratedSchema> {
  (options?: UseMutationOptions<unknown>): TSchema['mutation'] & {
    $state: UseMutationState;
  };

  <TData, TArgs = never>(
    fn?: (mutation: NonNullable<TSchema['mutation']>, args: TArgs) => TData,
    options?: UseMutationOptions<TData>
  ): readonly [
    (options?: { fn?: typeof fn; args: TArgs }) => Promise<TData>,
    UseMutationState & { data?: TData extends void ? unknown : TData }
  ];
}

export const createUseMutation = <TSchema extends BaseGeneratedSchema>(
  { createResolver, resolve, refetch }: GQtyClient<TSchema>,
  {
    defaults: { mutationSuspense: defaultSuspense, retry: defaultRetry },
  }: ReactClientOptionsWithDefaults
) => {
  const useMutation: UseMutation<TSchema> = (
    fnOrOptions?:
      | UseMutationOptions<unknown>
      | ((mutation: NonNullable<TSchema['mutation']>, args: unknown) => any),
    options?: UseMutationOptions<unknown>
  ): any => {
    if (typeof fnOrOptions === 'function') {
      return useLazyMutation(fnOrOptions, options);
    } else {
      return useProxyMutation(fnOrOptions);
    }
  };

  const useProxyMutation = ({
    onCompleted,
    onError,
    operationName,
    retry = defaultRetry,
    refetchQueries = [],
    awaitRefetchQueries,
    suspense = defaultSuspense,
    noCache = false,
  }: UseMutationOptions<unknown> = {}): TSchema['mutation'] & {
    $state: UseMutationState;
  } => {
    const { accessor, context, resolve, selections } = React.useMemo(() => {
      return createResolver({
        cachePolicy: noCache ? 'no-store' : 'no-cache',
        operationName,
        retryPolicy: retry,
        onSelect: () => {
          // Trigger re-render when selection happens after rendering, the
          // next useEffect() will fetch the mutation. We should skip this
          // during render to prevent infinite loop.
          render();
        },
      });
    }, [noCache, operationName, retry]);

    const render = useSafeRender();
    const [state, setState] = React.useState<{
      error?: GQtyError;
      promise?: Promise<unknown>;
    }>({});

    if (suspense) {
      if (state.promise) throw state.promise;
      if (state.error) throw state.error;
    }

    // useEffect() has to run every render because components after this one
    // may also add selections, instead we block exccessive fetch and infinite
    // loops inside the callback.
    React.useEffect(() => {
      if (selections.size === 0 || state.promise || !context.shouldFetch)
        return;

      const promise = resolve();

      // Prevent infinite render loop
      state.promise = promise;

      // Trigger one render for suspense
      setState({ promise });

      promise
        .then((data) => {
          const refetches = refetchQueries.map((v) => refetch(v));

          return awaitRefetchQueries
            ? Promise.all(refetches).then(() => data)
            : data;
        })
        .then(
          (data) => {
            onCompleted?.(data);
            setState({});
          },
          (e) => {
            const error = GQtyError.create(e);
            onError?.(error);
            setState({ error });
          }
        )
        .finally(() => {
          if (state.promise === promise) {
            context.shouldFetch = false;
            context.hasCacheHit = false;
            context.hasCacheMiss = false;
          }

          selections.clear();
        });
    });

    return React.useMemo(() => {
      return new Proxy<TSchema['mutation'] & { $state: UseMutationState }>(
        {
          $state: {
            get error() {
              return state.error;
            },
            get isLoading() {
              return state.promise !== undefined;
            },
          },
        },
        {
          get: (target, key, receiver) =>
            Reflect.get(target, key, receiver) ??
            Reflect.get(accessor.mutation ?? {}, key),
        }
      );
    }, [accessor, state]);
  };

  const useLazyMutation = <TData, TArgs = never>(
    mutationFn: (
      mutation: NonNullable<TSchema['mutation']>,
      args: TArgs
    ) => TData,
    {
      onCompleted,
      onError,
      retry = defaultRetry,
      refetchQueries = [],
      awaitRefetchQueries,
      suspense = defaultSuspense,
      noCache = false,
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
            }
          ).then((data) => {
            const refetches = refetchQueries.map((v) => refetch(v));

            return awaitRefetchQueries
              ? Promise.all(refetches).then(() => data)
              : data;
          }) as Promise<TData>;

          setState({ promise });

          const data = await promise;

          onCompleted?.(data);
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
