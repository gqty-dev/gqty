import { GQtyError, type BaseGeneratedSchema, type GQtyClient } from 'gqty';
import { useSyncExternalStore } from 'use-sync-external-store/shim/index.js';

import { createMemoryStore } from '../memoryStore';
import type { ReactClientOptionsWithDefaults } from '../utils';

export interface UsePreparedQueryOptions {
  suspense?: boolean;
}

export type TQueryFunction<
  TSchema extends BaseGeneratedSchema,
  TArgs = Record<string, any> | undefined,
  TData = unknown
> = (query: TSchema['query'], args: TArgs) => TData;

export interface PreparedQuery<
  TSchema extends BaseGeneratedSchema,
  TFunction extends TQueryFunction<TSchema>
> {
  preload: PreloadFn<TSchema, TFunction>;
  refetch: RefetchFn<TSchema, TFunction>;
  usePrepared: UsePreparedHook<TSchema, TFunction>;
  callback: TFunction;
}

export type PreloadFn<
  TSchema extends BaseGeneratedSchema,
  TFunction extends TQueryFunction<TSchema>
> = (args?: Parameters<TFunction>[1]) => Promise<ReturnType<TFunction>>;

export type RefetchFn<
  TSchema extends BaseGeneratedSchema,
  TFunction extends TQueryFunction<TSchema>
> = (args?: Parameters<TFunction>[1]) => Promise<ReturnType<TFunction>>;

export type UsePreparedHook<
  TSchema extends BaseGeneratedSchema,
  TFunction extends TQueryFunction<TSchema>
> = (
  options?: UsePreparedQueryOptions
) => PreparedQueryState<ReturnType<TFunction>>;

export type PreparedQueryState<TData = unknown> = {
  data?: TData;
  error?: GQtyError;
  promise?: Promise<TData>;
  isLoading: boolean;
  isRefetching: boolean;
  called: boolean;
};

export interface PrepareQuery<TSchema extends BaseGeneratedSchema> {
  <TFunction extends TQueryFunction<TSchema>>(fn: TFunction): PreparedQuery<
    TSchema,
    TFunction
  >;
}

export function createPrepareQuery<TSchema extends BaseGeneratedSchema>(
  { prefetch, query, refetch: clientRefetch }: GQtyClient<TSchema>,
  {
    defaults: { preparedSuspense: defaultSuspense },
  }: ReactClientOptionsWithDefaults
) {
  const prepareQuery: PrepareQuery<TSchema> = (fn) => {
    type TFunction = typeof fn;
    type TData = ReturnType<TFunction>;

    const store = createMemoryStore<PreparedQueryState<TData>>({
      called: false,
      isLoading: false,
      isRefetching: false,
    });

    const preload: PreloadFn<TSchema, TFunction> = async (args) => {
      store.set({
        data: undefined,
        error: undefined,
        promise: undefined,
        called: true,
        isLoading: true,
        isRefetching: false,
      });

      const promise = prefetch((query) => fn(query, args)) as
        | Promise<TData>
        | TData;

      if (promise instanceof Promise) {
        store.add({ promise });
      }

      try {
        const data = await promise;

        store.add({
          data,
          promise: undefined,
          isLoading: false,
        });

        return data;
      } catch (error) {
        store.add({
          error: GQtyError.create(error),
          promise: undefined,
          isLoading: false,
        });

        throw error;
      }
    };

    const refetch: RefetchFn<TSchema, TFunction> = async (args) => {
      store.set({
        data: undefined,
        error: undefined,
        promise: undefined,
        called: true,
        isLoading: false,
        isRefetching: true,
      });

      const promise = clientRefetch(() => fn(query, args)) as Promise<TData>;

      store.add({ promise });

      try {
        const data = await promise;

        store.add({
          data,
          promise: undefined,
          isRefetching: false,
        });

        return data;
      } catch (error) {
        store.add({
          error: GQtyError.create(error),
          promise: undefined,
          isRefetching: false,
        });

        throw error;
      }
    };

    const usePrepared: UsePreparedHook<TSchema, TFunction> = ({
      suspense = defaultSuspense,
    } = {}) => {
      const state = useSyncExternalStore(store.subscribe, store.get);

      if (suspense) {
        if (state.promise) throw state.promise;
        if (state.error) throw state.error;
      }

      return state;
    };

    return {
      preload,
      refetch,
      usePrepared,
      callback: fn,
    };
  };

  return prepareQuery;
}
