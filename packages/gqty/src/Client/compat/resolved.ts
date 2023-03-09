import type { QueryPayload } from 'gqty/Schema';
import type { GraphQLError } from 'graphql';
import { MessageType } from 'graphql-ws';
import type { CloseEvent } from 'ws';
import type { BaseGeneratedSchema } from '..';
import { GQtyError, RetryOptions } from '../../Error';
import { buildQuery } from '../../QueryBuilder';
import {
  FetchResult,
  fetchSelections,
  isCloseEvent,
  QueryExtensions,
} from '../resolveSelections';
import { updateCaches } from '../updateCaches';
import type { CreateLegacyMethodOptions } from './client';
import { convertSelection, type LegacySelection } from './selection';

export interface LegacyFetchOptions extends Omit<RequestInit, 'body'> {}

export interface LegacyResolved {
  <T = unknown>(fn: () => T, opts?: LegacyResolveOptions<T>): Promise<T>;
}

export interface LegacyResolveOptions<TData> {
  /**
   * Ignore cache data during selection, which always results in a fetch.
   */
  refetch?: boolean;
  /**
   * Do not update the cache after fetch, return the result only.
   */
  noCache?: boolean;
  /**
   * Activate special handling of non-serializable variables,
   * for example, files uploading
   *
   * @default false
   */
  nonSerializableVariables?: boolean;
  /**
   * Middleware function that is called if valid cache is found
   * for all the data requirements, it should return `true` if the
   * the resolution and fetch should continue, and `false`
   * if you wish to stop the resolution, resolving the promise
   * with the existing cache data.
   */
  onCacheData?: (data: TData) => boolean;
  /**
   * On No Cache found
   */
  onNoCacheFound?: () => void;
  /**
   * Get every selection intercepted in the specified function
   */
  onSelection?: (selection: LegacySelection) => void;
  /**
   * On subscription event listener
   */
  onSubscription?: (
    event:
      | {
          type: 'data';
          unsubscribe: () => Promise<void>;
          data: TData;
          error?: undefined;
        }
      | {
          type: 'with-errors';
          unsubscribe: () => Promise<void>;
          data?: TData;
          error: GQtyError;
        }
      | {
          type: 'start' | 'complete';
          unsubscribe: () => Promise<void>;
          data?: undefined;
          error?: undefined;
        }
  ) => void;
  /**
   * Function called on empty resolution
   */
  onEmptyResolve?: () => void;

  /**
   * Retry strategy
   */
  retry?: RetryOptions;

  /**
   * Pass any extra fetch options
   */
  fetchOptions?: LegacyFetchOptions;

  /**
   * Query operation name
   */
  operationName?: string;
}

/**
 * `resolved()` has to be re-implemented from the parts because the new
 * `resolve()` closes subscriptions on first data to mimic a one-time promise,
 * while `resolved()` exposes callbacks, letting subcriptions outlive the
 * promise.
 */
export const createLegacyResolved = <
  TSchema extends BaseGeneratedSchema = BaseGeneratedSchema
>({
  cache,
  context: globalContext,
  debugger: debug,
  fetchOptions: { fetcher, subscriber, retryPolicy },
  resolvers: { createResolver },
  subscribeLegacySelections: subscribeSelections,
}: CreateLegacyMethodOptions<TSchema>): LegacyResolved => {
  const resolved: LegacyResolved = async <TData = unknown>(
    fn: () => TData,
    {
      fetchOptions,
      noCache = false, // prevent cache writes after fetch
      //nonSerializableVariables, // Ignored, object-hash can handle files
      onCacheData,
      onEmptyResolve,
      onNoCacheFound,
      onSelection,
      onSubscription,
      operationName,
      refetch = false, // prevent cache reads from selections
      retry = retryPolicy,
    }: LegacyResolveOptions<TData> = {}
  ) => {
    const { context, selections } = createResolver({
      fetchPolicy: noCache ? 'no-store' : refetch ? 'no-cache' : 'default',
      operationName,
    });
    const unsubscribe = subscribeSelections((selection, cache) => {
      context.onSelect?.(selection, cache);
      onSelection?.(convertSelection(selection));
    });
    const resolutionCache = refetch ? cache : context.cache;
    const targetCaches = noCache
      ? [context.cache]
      : refetch
      ? [context.cache, cache]
      : [cache];
    const dataFn = () => {
      globalContext.cache = resolutionCache;

      try {
        return fn();
      } finally {
        globalContext.cache = cache;
      }
    };

    context.shouldFetch ||= noCache || refetch;

    const data = dataFn();

    unsubscribe();

    if (selections.size === 0) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[gqty] Warning! No data requested.');
      }
      onEmptyResolve?.();
      return data;
    }

    if (!context.shouldFetch) {
      return data;
    }

    if (context.hasCacheHit) {
      if (onCacheData?.(data) === false) {
        return data;
      }
    } else {
      onNoCacheFound?.();
    }

    // Subscriptions
    buildQuery(
      new Set(
        [...selections].filter(({ root: { key } }) => key === 'subscription')
      ),
      operationName
    ).map(
      ({
        query,
        variables,
        operationName,
        extensions: { type, hash } = {},
      }) => {
        if (!type) throw new GQtyError(`Invalid query type: ${type}`);
        if (!hash) throw new GQtyError(`Expected query hash: ${hash}`);

        const payload: QueryPayload<QueryExtensions> = {
          query,
          variables,
          operationName,
          extensions: { type, hash },
        };

        let subscriptionId: string | undefined;
        subscriber?.on('message', (message) => {
          switch (message.type) {
            case MessageType.Subscribe: {
              if (message.payload.extensions?.hash !== hash) break;

              subscriptionId = message.id;

              debug?.dispatch({
                cache,
                label: `[id=${subscriptionId}] [create]`,
                request: payload,
                selections,
              });

              break;
            }
          }
        });

        const _unsubscribe = subscriber?.subscribe<TData, QueryExtensions>(
          { query, variables, operationName },
          {
            next(result) {
              result.extensions = payload.extensions;

              if (result.data != null) {
                updateCaches([result as FetchResult], targetCaches);
              }

              debug?.dispatch({
                cache,
                label: subscriptionId
                  ? `[id=${subscriptionId}] [data]`
                  : undefined,
                request: payload,
                result: result as FetchResult,
                selections,
              });

              onSubscription?.({
                type: 'data',
                data: dataFn() ?? (result as TData),
                unsubscribe,
              });
            },
            error(error: Error | readonly GraphQLError[] | CloseEvent) {
              if (isCloseEvent(error)) {
                unsubscribe();
                return this.complete();
              }

              const theError = Array.isArray(error)
                ? GQtyError.fromGraphQLErrors(error)
                : GQtyError.create(error);

              debug?.dispatch({
                cache,
                label: subscriptionId
                  ? `[id=${subscriptionId}] [error]`
                  : undefined,
                request: payload,
                result: { error: theError },
                selections,
              });

              onSubscription?.({
                type: 'with-errors',
                error: theError,
                unsubscribe,
              });
            },
            complete() {
              debug?.dispatch({
                cache,
                label: subscriptionId
                  ? `[id=${subscriptionId}] [unsubscribe]`
                  : undefined,
                request: payload,
                selections,
              });

              onSubscription?.({
                type: 'complete',
                unsubscribe,
              });
            },
          }
        );

        const unsubscribe = async () => _unsubscribe?.();

        onSubscription?.({
          type: 'start',
          unsubscribe,
        });
      }
    );

    // Queries and mutations
    await fetchSelections(
      new Set(
        [...selections].filter(({ root: { key } }) => key !== 'subscription')
      ),
      {
        debugger: debug,
        fetchOptions: { fetcher, retryPolicy: retry, ...fetchOptions },
        operationName,
      }
    ).then(
      (results) => updateCaches(results, targetCaches),
      (error) => Promise.reject(GQtyError.create(error))
    );

    return dataFn();
  };

  return resolved;
};
