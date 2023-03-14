import type { ExecutionResult } from 'graphql';
import type { Client as SseClient } from 'graphql-sse';
import type { Client as WsClient } from 'graphql-ws';
import { MessageType, SubscribePayload } from 'graphql-ws';
import { CloseEvent, WebSocket } from 'ws';
import type { FetchOptions } from '.';
import type { Cache } from '../Cache';
import { dedupePromise } from '../Cache/query';
import { doRetry, GQtyError } from '../Error';
import { notifyFetch, notifyRetry } from '../Helpers/useMetaStateHack';
import { buildQuery } from '../QueryBuilder';
import type { QueryPayload } from '../Schema';
import type { Selection } from '../Selection';
import type { Debugger } from './debugger';

export type FetchSelectionsOptions = {
  cache?: Cache;
  debugger?: Debugger;
  fetchOptions: FetchOptions;
  operationName?: string;
};

export type QueryExtensions = { type: string; hash: string };

export type FetchResult<
  TData extends Record<string, unknown> = Record<string, unknown>
> = Omit<ExecutionResult<TData>, 'errors'> & { error?: Error | GQtyError };

export const fetchSelections = <
  TData extends Record<string, unknown> = Record<string, unknown>
>(
  selections: Set<Selection>,
  {
    cache,
    debugger: debug,
    fetchOptions,
    operationName,
  }: FetchSelectionsOptions
): Promise<FetchResult<TData>[]> =>
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

        const queryPayload: QueryPayload<QueryExtensions> = {
          query,
          variables,
          operationName,
          extensions: { type, hash },
        };

        // Dedupe
        const { data, errors, extensions } = await dedupePromise(
          cache,
          hash,
          type === 'subscription'
            ? () => doSubscribeOnce<TData>(queryPayload, fetchOptions)
            : () =>
                doFetch<TData>(queryPayload, { ...fetchOptions, selections })
        );

        const result: FetchResult<TData> = {
          data,
          extensions: { ...extensions, ...queryPayload.extensions },
        };

        if (errors?.length) {
          result.error = GQtyError.fromGraphQLErrors(errors);
        }

        debug?.dispatch({
          cache,
          request: queryPayload,
          result,
          selections,
        });

        return result;
      }
    )
  );

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
 * happens when all listeners are unsubscribed.
 */
const subsRef = new WeakMap<
  Promise<unknown>,
  {
    dispose: () => void;
    count: number;
  }
>();

export const subscribeSelections = <
  TData extends Record<string, unknown> = Record<string, unknown>
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
    fetchOptions: { subscriber, ...fetchOptions },
    operationName,
    onSubscribe,
    onComplete,
  }: SubscribeSelectionOptions
): Unsubscribe => {
  const unsubscribers = new Set<() => void>();

  Promise.all(
    buildQuery(selections, operationName).map(
      ({
        query,
        variables,
        operationName,
        extensions: { type, hash } = {},
      }) => {
        if (!type) {
          throw new GQtyError(`Invalid query type: ${type}`);
        }

        if (!hash) {
          throw new GQtyError(`Expected query hash.`);
        }

        if (type === 'subscription' && !subscriber) {
          throw new GQtyError(`Missing subscriber for subscriptions.`);
        }

        const queryPayload: QueryPayload<QueryExtensions> = {
          query,
          variables,
          operationName,
          extensions: { type, hash },
        };

        let subscriptionId: string | undefined;

        if (isWsClient(subscriber)) {
          {
            const unsub = subscriber?.on('message', (message) => {
              switch (message.type) {
                case MessageType.ConnectionAck: {
                  unsub?.();
                  onSubscribe?.();
                  break;
                }
              }
            });
          }

          {
            const unsub = subscriber?.on('message', (message) => {
              switch (message.type) {
                case MessageType.ConnectionAck: {
                  break;
                }
                case MessageType.Subscribe: {
                  if (message.payload.extensions?.hash !== hash) return;

                  subscriptionId = message.id;

                  debug?.dispatch({
                    cache,
                    label: `[id=${subscriptionId}] [create]`,
                    request: queryPayload,
                    selections,
                  });

                  unsub?.();
                  break;
                }
              }
            });
          }
        } else if (isSseClient(subscriber)) {
          // TODO: Get id via constructor#onMessage option, this requires
          // modifications to the generated client.
          subscriptionId = 'EventSource';
          onSubscribe?.();
        } else if (type === 'subscription') {
          throw new GQtyError(`Please specify a subscriber for subscriptions.`);
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
            result,
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

          fn({
            error,
            extensions: queryPayload.extensions,
          });
        };

        let dispose: (() => void) | undefined;

        // Dedupe
        const promise = dedupePromise(
          type === 'subscription' ? undefined : cache,
          hash,
          type === 'subscription'
            ? () =>
                new Promise<void>((complete) => {
                  dispose = subscriber!.subscribe<TData>(queryPayload, {
                    next,
                    error(err) {
                      if (Array.isArray(err)) {
                        error(GQtyError.fromGraphQLErrors(err));
                      } else if (!isCloseEvent(err)) {
                        error(GQtyError.create(err));
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
                  });
                })
            : () =>
                new Promise<void>((complete) => {
                  const options: Parameters<typeof doFetch>[1] = {
                    ...fetchOptions,
                    selections,
                  };

                  if (typeof AbortController !== 'undefined') {
                    const aborter = new AbortController();
                    dispose = () => aborter.abort();
                    options.signal = aborter.signal;
                  }

                  doFetch<TData>(queryPayload, options)
                    .then(next, error)
                    .finally(complete);
                })
        );

        if (dispose) {
          subsRef.set(promise, { dispose, count: 1 });
        } else if (subsRef.get(promise)) {
          subsRef.get(promise)!.count++;
        }

        unsubscribers.add(() => {
          const ref = subsRef.get(promise);
          if (ref && --ref.count <= 0) {
            ref.dispose();
          }
        });
      }
    )
  ).finally(() => onComplete?.());

  return () => {
    unsubscribers.forEach((fn) => fn());
  };
};

const doFetch = async <
  TData extends Record<string, unknown> = Record<string, unknown>
>(
  payload: QueryPayload,
  {
    fetcher,
    retryPolicy,
    selections,
    ...fetchOptions
  }: FetchOptions & { selections: Set<Selection> }
): Promise<ExecutionResult<TData>> => {
  // lol
  const doDoFetch = () =>
    fetcher(payload, fetchOptions) as Promise<ExecutionResult<TData>>;

  try {
    const promise = doDoFetch();

    notifyFetch(promise, selections);

    return await promise;
  } catch (error) {
    if (!retryPolicy || !(error instanceof Error)) throw error;

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
  TData extends Record<string, unknown> = Record<string, unknown>
>(
  { query, variables, operationName }: SubscribePayload,
  { subscriber }: FetchOptions
) => {
  if (!subscriber) {
    throw new GQtyError(`Subscription client is required for subscritions.`);
  }

  return new Promise<ExecutionResult<TData, Record<string, unknown>>>(
    (resolve, reject) => {
      let result: any;

      const unsubscribe = subscriber.subscribe(
        {
          query,
          variables: variables ?? {},
          operationName: operationName ?? undefined,
        },
        {
          next(data) {
            result = data;
            unsubscribe();
          },
          error(error) {
            if (isCloseEvent(error)) {
              resolve(result);
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

  return (
    (error.type === 'close' && error.target instanceof WebSocket) ||
    (typeof error.code === 'number' &&
      [
        4004, 4005, 4400, 4401, 4403, 4406, 4408, 4409, 4429, 4499, 4500, 4504,
      ].includes(error.code))
  );
};

const isWsClient = (client?: SseClient | WsClient): client is WsClient => {
  return client !== undefined && typeof (client as WsClient).on === 'function';
};

const isSseClient = (client?: SseClient | WsClient): client is SseClient =>
  client !== undefined && !isWsClient(client);

// TODO: Test unsubscribe on both subscription and fetch with concurrent subscribers.
