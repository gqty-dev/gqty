import type { ExecutionResult } from 'graphql';
import type { SubscribePayload } from 'graphql-ws';
import { CloseEvent, WebSocket } from 'ws';
import type { FetchOptions } from '.';
import type { Cache } from '../Cache';
import { dedupePromise } from '../Cache/query';
import { doRetry, GQtyError } from '../Error';
import { buildQuery } from '../QueryBuilder';
import type { QueryPayload } from '../Schema';
import type { Selection } from '../Selection';

export type FetchSelectionsOptions = {
  fetchOptions: FetchOptions;
  operationName?: string;
  cache?: Cache;
};

export type FetchResult<
  TData extends Record<string, unknown> = Record<string, unknown>
> = ExecutionResult<TData, { type: string; hash: string }>;

export const fetchSelections = <
  TData extends Record<string, unknown> = Record<string, unknown>
>(
  selections: Set<Selection>,
  { cache, fetchOptions, operationName }: FetchSelectionsOptions
): Promise<FetchResult<TData>[]> =>
  Promise.all(
    buildQuery(selections, operationName).map(
      async ({
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

        const payload = { query, variables, operationName };

        // Dedupe
        const result = await dedupePromise(
          cache,
          hash,
          type === 'subscription'
            ? () => doSubscribeOnce<TData>(payload, fetchOptions)
            : () => doFetch<TData>(payload, fetchOptions)
        );

        return { ...result, extensions: { type, hash } };
      }
    )
  );

export type SubscriptionCallback<TData extends Record<string, unknown>> = (
  result: FetchResult<TData> | Record<string, never>
) => void;

export type Unsubscribe = () => void;

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
    fetchOptions: { subscriber, ...fetchOptions },
    operationName,
  }: FetchSelectionsOptions
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

        const queryPayload = { query, variables, operationName };

        const next = ({ data, errors, extensions }: ExecutionResult<TData>) => {
          if (data === undefined) return;

          fn({ data, errors, extensions: { ...extensions, type, hash } });
        };

        const error = (error: unknown) => {
          if (error == null) {
            throw new GQtyError(`Subscription sink closed without an error.`);
          }

          fn({ errors: [error as any] });
        };

        // Dedupe
        return dedupePromise(
          type === 'subscription' ? undefined : cache,
          hash,
          type === 'subscription'
            ? () =>
                new Promise<void>((complete) => {
                  const unsubscribe = subscriber?.subscribe<TData>(
                    queryPayload,
                    {
                      next,
                      error(err) {
                        if (isCloseEvent(err)) {
                          this.complete();
                        } else if (Array.isArray(err)) {
                          error(GQtyError.fromGraphQLErrors(err));
                        } else {
                          error(err);
                        }
                      },
                      complete,
                    }
                  );

                  if (unsubscribe) {
                    unsubscribers.add(unsubscribe);
                  }
                })
            : () =>
                new Promise<void>((complete) => {
                  const aborter = new AbortController();

                  doFetch<TData>(queryPayload, {
                    ...fetchOptions,
                    signal: aborter.signal,
                  })
                    .then(next, error)
                    .finally(complete);

                  unsubscribers.add(() => aborter.abort());
                })
        );
      }
    )
  ).finally(() => fn({}));

  return () => {
    unsubscribers.forEach((fn) => fn());
  };
};

const doFetch = async <
  TData extends Record<string, unknown> = Record<string, unknown>
>(
  payload: QueryPayload,
  { fetcher, retryPolicy, ...fetchOptions }: FetchOptions
): Promise<ExecutionResult<TData>> => {
  // lol
  const doDoFetch = () =>
    fetcher(payload, fetchOptions) as Promise<ExecutionResult<TData>>;

  try {
    return await doDoFetch();
  } catch (error) {
    if (!retryPolicy || !(error instanceof Error)) throw error;

    return new Promise((resolve, reject) => {
      doRetry(retryPolicy!, {
        onLastTry: async () => {
          try {
            resolve(await doDoFetch());
          } catch (e) {
            reject(e);
          }
        },
        onRetry: async () => {
          resolve(await doDoFetch());
        },
      });
    });
  }
};

const doSubscribeOnce = async <
  TData extends Record<string, unknown> = Record<string, unknown>
>(
  payload: SubscribePayload,
  { subscriber }: FetchOptions
) => {
  if (!subscriber) {
    throw new GQtyError(`Subscription client is required for subscritions.`);
  }

  return new Promise<ExecutionResult<TData, Record<string, unknown>>>(
    (resolve, reject) => {
      let result: any;

      const unsubscribe = subscriber.subscribe(payload, {
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
      });
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
