import type { QueryPayload } from 'gqty/Schema';
import type { GraphQLError } from 'graphql';
import { MessageType } from 'graphql-ws';
import type { BaseGeneratedSchema } from '..';
import { Cache } from '../../Cache';
import { GQtyError, RetryOptions } from '../../Error';
import { buildQuery } from '../../QueryBuilder';
import type { Selection } from '../../Selection';
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
  context,
  debugger: debug,
  fetchOptions: { fetcher, subscriber, retryPolicy },
  subscribeLegacySelections: subscribeSelections,
}: CreateLegacyMethodOptions<TSchema>): LegacyResolved => {
  return async <TData = unknown>(
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
    let hasCacheHit = false;
    let shouldFetch = refetch || noCache;
    const selections = new Set<Selection>();
    const resolutionCache = noCache ? new Cache() : cache;
    const dataFn = () => {
      context.cache = resolutionCache;

      try {
        return fn();
      } finally {
        context.cache = cache;
      }
    };

    const unsubscribe = subscribeSelections((selection, cache) => {
      shouldFetch ||= cache?.data === undefined;
      hasCacheHit ||= cache?.data !== undefined;

      selections.add(selection);
      onSelection?.(convertSelection(selection));
    });

    const data = dataFn();

    unsubscribe();

    if (selections.size === 0) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[gqty] Warning! No data requested.');
      }
      onEmptyResolve?.();
      return data;
    }

    if (!shouldFetch) {
      return data;
    }

    if (hasCacheHit) {
      onCacheData?.(data);
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
                updateCaches([result as FetchResult], [resolutionCache]);
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

              onSubscription?.({
                type: 'with-errors',
                error: Array.isArray(error)
                  ? GQtyError.fromGraphQLErrors(error)
                  : new GQtyError(`Subscription error`, { otherError: error }),
                unsubscribe,
              });
            },
            complete() {
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
      (results) => updateCaches(results, [resolutionCache]),
      (error) => Promise.reject(GQtyError.create(error, () => {}))
    );

    return dataFn();
  };
};
