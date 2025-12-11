import type { ExecutionResult } from 'graphql';
import type { Client as SseClient } from 'graphql-sse';
import type { MessageType, SubscribePayload } from 'graphql-ws';
import type { CloseEvent } from 'ws';
import type { FetchOptions } from '.';
import type { Cache } from '../Cache';
import { dedupePromise } from '../Cache/query';
import { GQtyError, doRetry } from '../Error';
import { notifyFetch, notifyRetry } from '../Helpers/useMetaStateHack';
import { buildQuery } from '../QueryBuilder';
import type { QueryPayload } from '../Schema';
import {
  decrementFetchingCacheKey,
  incrementFetchingCacheKey,
  type Selection,
} from '../Selection';
import type { Debugger } from './debugger';
import { isWsClient, type GQtyWsClient } from './subscriber';

export type ResolverFetchOptions = Omit<FetchOptions, 'subscriber'> & {
  subscriber?: SseClient | GQtyWsClient;
};

export type FetchSelectionsOptions = {
  cache?: Cache;
  debugger?: Debugger;
  extensions?: Record<string, unknown>;
  fetchOptions: ResolverFetchOptions;
  operationName?: string;
};

export type QueryExtensions = { type: string; hash: string };

export type FetchResult<
  TData extends Record<string, unknown> = Record<string, unknown>,
> = Omit<ExecutionResult<TData>, 'errors'> & { error?: Error | GQtyError };

export const fetchSelections = <
  TData extends Record<string, unknown> = Record<string, unknown>,
>(
  selections: Set<Selection>,
  {
    cache,
    debugger: debug,
    extensions: customExtensions,
    fetchOptions,
    operationName,
  }: FetchSelectionsOptions
): Promise<FetchResult<TData>[]> => {
  const fetchingCacheKeys = new Set<string>();
  for (const selection of selections) {
    const keys = selection.cacheKeys;
    for (let i = 1; i <= keys.length; i++) {
      fetchingCacheKeys.add(keys.slice(0, i).join('.'));
    }
  }

  for (const cacheKey of fetchingCacheKeys) {
    incrementFetchingCacheKey(cacheKey);
  }

  return Promise.all(
    buildQuery(selections, operationName).map(
      async ({
        query,
        variables,
        operationName,
        extensions: { type, hash } = {},
      }) => {
        if (!type) throw new GQtyError(`Invalid query type: ${type}`);
        if (!hash) throw new GQtyError(`Expected query hash.`);

        const queryPayload: QueryPayload<QueryExtensions> = {
          query,
          variables,
          operationName,
          extensions: { ...customExtensions, type, hash },
        };

        // Dedupe
        const promise = dedupePromise(
          cache,
          hash,
          type === 'subscription'
            ? () => doSubscribeOnce<TData>(queryPayload, fetchOptions)
            : () =>
                doFetch<TData>(queryPayload, { ...fetchOptions, selections })
        ).then(({ data, errors, extensions }) => {
          const result: FetchResult<TData> = {
            data,
            extensions: { ...extensions, ...queryPayload.extensions },
          };

          if (errors?.length) {
            result.error = GQtyError.fromGraphQLErrors(errors);
          }

          return result;
        });

        await debug?.dispatch({
          cache,
          request: queryPayload,
          promise,
          selections,
        });

        return await promise;
      }
    )
  ).finally(() => {
    for (const cacheKey of fetchingCacheKeys) {
      decrementFetchingCacheKey(cacheKey);
    }
  });
};

export type SubscribeSelectionOptions = FetchSelectionsOptions & {
  onComplete?: () => void;
  onSubscribe?: () => void;
};

export type SubscriptionCallback<TData extends Record<string, unknown>> = (
  result: FetchResult<TData>
) => void;

export type Unsubscribe = () => void;

/**
 * Reference count when there are more than one listeners, unsubscription
 * happens after no subscribers left after current loop.
 */
const subsRef = new WeakMap<
  Promise<unknown>,
  {
    dispose: () => void;
    count: number;
  }
>();

export const subscribeSelections = <
  TData extends Record<string, unknown> = Record<string, unknown>,
>(
  selections: Set<Selection>,
  /**
   * When a connection closes, this function will be called a last time without
   * any arguments.
   */
  fn: SubscriptionCallback<TData>,
  {
    cache,
    debugger: debug,
    extensions: customExtensions,
    fetchOptions: { subscriber },
    operationName,
    onSubscribe,
    onComplete,
  }: SubscribeSelectionOptions
): Unsubscribe => {
  const unsubscribers = new Set<() => void>();

  Promise.all(
    buildQuery(selections, operationName).map(
      async ({
        query,
        variables,
        operationName,
        extensions: { type, hash } = {},
      }) => {
        if (!type) throw new GQtyError(`Invalid query type: ${type}`);
        if (!hash) throw new GQtyError(`Expected query hash.`);

        if (type === 'subscription' && !subscriber) {
          throw new GQtyError(`Missing subscriber for subscriptions.`);
        }

        const queryPayload: QueryPayload<QueryExtensions> = {
          query,
          variables,
          operationName,
          extensions: { ...customExtensions, type, hash },
        };

        let subscriptionId: string | undefined;

        if (isWsClient(subscriber)) {
          if (onSubscribe) {
            subscriber.onSubscribe(onSubscribe);
          }

          if (debug) {
            const unsub = subscriber.on('message', (message) => {
              switch (message.type) {
                case 'connection_ack' as MessageType.ConnectionAck: {
                  break;
                }
                case 'subscribe' as MessageType.Subscribe: {
                  if (message.payload.extensions?.hash !== hash) return;

                  subscriptionId = message.id;

                  debug.dispatch({
                    cache,
                    label: `[id=${subscriptionId}] [create]`,
                    request: queryPayload,
                    selections,
                  });

                  unsub();
                  break;
                }
              }
            });
          }
        } else {
          // [ ] Get id via constructor#onMessage option, this requires
          // modifications to the generated client.
          subscriptionId = 'EventSource';
          onSubscribe?.();
        }

        const next = ({ data, errors, extensions }: ExecutionResult<TData>) => {
          if (data === undefined) return;

          const result: FetchResult<TData> = {
            data,
            extensions: { ...extensions, ...queryPayload.extensions },
          };

          if (errors?.length) {
            result.error = GQtyError.fromGraphQLErrors(errors);
          }

          debug?.dispatch({
            cache,
            label: subscriptionId ? `[id=${subscriptionId}] [data]` : undefined,
            request: queryPayload,
            promise: result.error
              ? Promise.reject(result)
              : Promise.resolve(result),
            selections,
          });

          fn(result);
        };

        const error = (error: GQtyError) => {
          if (error == null) {
            throw new GQtyError(`Subscription sink closed without an error.`);
          }

          debug?.dispatch({
            cache,
            label: subscriptionId
              ? `[id=${subscriptionId}] [error]`
              : undefined,
            request: queryPayload,
            selections,
          });

          fn({ error, extensions: queryPayload.extensions });
        };

        let dispose: (() => void) | undefined;

        // Dedupe
        const promise = dedupePromise(cache, hash, () => {
          return new Promise<void>((complete) => {
            dispose = subscriber?.subscribe<TData, Record<string, unknown>>(
              queryPayload,
              {
                next,
                error(e) {
                  if (Array.isArray(e)) {
                    error(GQtyError.fromGraphQLErrors(e));
                  } else if (!isCloseEvent(e)) {
                    if (e instanceof Error) {
                      error(GQtyError.create(e));
                    } else {
                      console.error('Unknown subscription error:', e);
                    }
                  }

                  this.complete();
                },
                complete() {
                  debug?.dispatch({
                    cache,
                    label: subscriptionId
                      ? `[id=${subscriptionId}] [unsubscribe]`
                      : undefined,
                    request: queryPayload,
                    selections,
                  });

                  complete();
                },
              }
            );
          });
        });

        if (dispose) {
          subsRef.set(promise, { dispose, count: 1 });
        } else if (subsRef.get(promise)) {
          subsRef.get(promise)!.count++;
        }

        unsubscribers.add(() => {
          const ref = subsRef.get(promise);
          if (ref && --ref.count <= 0) {
            // Put this in the back of the event loop after current active
            // promises to prevent excessive re-subscriptions.
            setTimeout(() => {
              // Unsubscribe when nobody else joins till this line.
              if (ref.count <= 0) {
                ref.dispose();
              }
            });
          }
        });

        return promise;
      }
    )
  ).finally(() => onComplete?.());

  return () => {
    unsubscribers.forEach((fn) => fn());
  };
};

const doFetch = async <
  TData extends Record<string, unknown> = Record<string, unknown>,
>(
  payload: QueryPayload,
  {
    fetcher,
    retryPolicy,
    selections,
    ...fetchOptions
  }: FetchOptions & { selections: Set<Selection> }
): Promise<ExecutionResult<TData>> => {
  // lol, sorry for bad naming.
  const doDoFetch = () =>
    fetcher(payload, fetchOptions) as Promise<ExecutionResult<TData>>;

  try {
    const promise = doDoFetch();

    notifyFetch(promise, selections);

    return await promise;
  } catch (error) {
    if (
      // User doesn't want reties
      !retryPolicy ||
      // Let everything unknown through
      !(error instanceof Error) ||
      // GQtyErrors are supposed to be terminating
      error instanceof GQtyError
      // [ ] Supersede the above with the callback ClientOption#onError:
      // (error: unknown, { retryAttempt, retry }) => void
    ) {
      throw error;
    }

    return new Promise((resolve, reject) => {
      // Selections are attached solely for useMetaState()
      doRetry(retryPolicy!, {
        onLastTry: async () => {
          try {
            const promise = doDoFetch();
            notifyRetry(promise, selections);
            resolve(await promise);
          } catch (e) {
            reject(e);
          }
        },
        onRetry: async () => {
          const promise = doDoFetch();
          notifyRetry(promise, selections);

          resolve(await promise);
        },
      });
    });
  }
};

const doSubscribeOnce = async <
  TData extends Record<string, unknown> = Record<string, unknown>,
>(
  { query, variables, operationName }: SubscribePayload,
  { subscriber }: FetchOptions
) => {
  if (!subscriber) {
    throw new GQtyError(`Subscription client is required for subscritions.`);
  }

  return new Promise<ExecutionResult<TData, Record<string, unknown>>>(
    (resolve, reject) => {
      let result: ExecutionResult<TData> | undefined;

      const unsubscribe = subscriber.subscribe(
        {
          query,
          variables: variables ?? {},
          operationName: operationName ?? undefined,
        },
        {
          next(data) {
            result = data as never;
            unsubscribe();
          },
          error(error) {
            if (isCloseEvent(error)) {
              resolve(result as never);
            } else if (Array.isArray(error)) {
              reject(GQtyError.fromGraphQLErrors(error));
            } else {
              reject(error);
            }
          },
          complete() {
            if (!result) {
              throw new GQtyError(`Subscription completed without data`);
            }

            resolve(result);
          },
        }
      );
    }
  );
};

export const isCloseEvent = (input: unknown): input is CloseEvent => {
  const error = input as CloseEvent;

  if (!error || typeof error !== 'object') return false;

  return (
    (error.type === 'close' &&
      error.target?.constructor?.name === 'WebSocket') ||
    (typeof error.code === 'number' &&
      [
        4004, 4005, 4400, 4401, 4403, 4406, 4408, 4409, 4429, 4499, 4500, 4504,
      ].includes(error.code))
  );
};
