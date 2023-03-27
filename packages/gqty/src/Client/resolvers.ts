import type { BaseGeneratedSchema, FetchOptions } from '.';
import { createSchemaAccessor } from '../Accessor';
import type { Cache } from '../Cache';
import type { GQtyError } from '../Error';
import type { ScalarsEnumsHash, Schema } from '../Schema';
import type { Selection } from '../Selection';
import { pick } from '../Utils/pick';
import { createContext, SchemaContext } from './context';
import type { Debugger } from './debugger';
import {
  fetchSelections,
  subscribeSelections,
  Unsubscribe,
} from './resolveSelections';
import { updateCaches } from './updateCaches';

export type CreateResolversOptions = {
  cache: Cache;
  debugger?: Debugger;
  depthLimit: number;
  fetchOptions: FetchOptions;
  scalars: ScalarsEnumsHash;
  schema: Readonly<Schema>;

  // `useRefetch` and `HOC` needs to grab selections from hooks of the same
  // component, we need to simulate what InterceptorManager did.
  parentContext?: SchemaContext;
};

export type Resolvers<TSchema extends BaseGeneratedSchema> = {
  /**
   * Create internal parts for `resolve()` and `subscribe()`, useful for
   * custom fetching logics. The React package uses this funciton.
   */
  createResolver: CreateResolverFn<TSchema>;

  /**
   * Query, mutation and subscription in a promise.
   *
   * Selections to queries and mutations are fetched with
   * `fetchOptions.fetcher`, the result is resolved with the cache updated
   * according to the current fetch policy
   *
   * Subscriptions are disconnected upon delivery of the first data message,
   * the cache is updated and the data is resolved, essentially behaving like
   * a promise.
   */
  resolve: ResolveFn<TSchema>;

  /**
   * Query, mutation and subscription in an async generator.
   *
   * Subscription data continuously update the cache, while queries and
   * mutations are fetched once and then listen to future cache changes
   * from the same selections.
   *
   * This function subscribes to *cache changes*, termination of underlying
   * subscription (WebSocket/EventSource) does not stop this generator.
   *
   * Calling `.return()` does not terminate pending promises, use
   * `onSubscribe()` to acquire the unsubscribe function.
   */
  subscribe: SubscribeFn<TSchema>;
};

export type CreateResolverFn<TSchema extends BaseGeneratedSchema> = (
  options?: ResolveOptions
) => {
  accessor: TSchema;
  context: SchemaContext;
  resolve: () => Promise<unknown>;
  selections: Set<Selection>;
  subscribe: (callbacks?: {
    onComplete?: () => void;
    onError?: (error: Error | GQtyError) => void;
    onNext?: (value: unknown) => void;
  }) => () => void;
};

export type ResolveFn<TSchema extends BaseGeneratedSchema> = <
  TData extends Record<string, unknown> = Record<string, unknown>
>(
  fn: DataFn<TSchema>,
  options?: ResolveOptions
) => Promise<TData>;

const asyncItDoneMessage = { done: true } as IteratorResult<never>;

export type SubscribeFn<TSchema extends BaseGeneratedSchema> = <
  TData extends Record<string, unknown> = Record<string, unknown>
>(
  fn: DataFn<TSchema>,
  options?: SubscribeOptions
) => AsyncGenerator<TData, void, unknown>;

export type DataFn<TSchema> = (schema: TSchema) => void;

export type ResolveOptions = {
  /**
   * Awaits resolution it the query results in a fetch. Specify `false` to
   * immediately return the current cache, placeholder data will be returned on
   * a partial or complete cache miss.
   *
   * @default true
   */
  awaitsFetch?: boolean;

  /**
   * Defines how a query should fetch from the cache and network.
   *
   * - `default`: Serves the cached contents when it is fresh, and if they are
   * stale within `staleWhileRevalidate` window, fetches in the background and
   * updates the cache. Or simply fetches on cache stale or cache miss. During
   * SWR, a successful fetch will not notify cache updates. New contents are
   * served on next query.
   * - `no-store`: Always fetch and does not update on response.
   * GQty creates a temporary cache at query-level which immediately expires.
   * - `no-cache`: Always fetch, updates on response.
   * - `force-cache`: Serves the cached contents regardless of staleness. It
   * fetches on cache miss or a stale cache, updates cache on response.
   * - `only-if-cached`: Serves the cached contents regardless of staleness,
   * throws a network error on cache miss.
   *
   * _It takes effort to make sure the above stays true for all supported
   * frameworks, please consider sponsoring so we can dedicate even more time on
   * this._
   */
  cachePolicy?: FetchOptions['cachePolicy'];

  retryPolicy?: FetchOptions['retryPolicy'];

  onFetch?: (fetchPromise: Promise<unknown>) => void;

  onSelect?: NonNullable<SchemaContext['onSelect']>;

  operationName?: string;
};

export type SubscribeOptions = {
  /**
   * Defines how a query should fetch from the cache and network.
   *
   * - `default`: Serves the cached contents when it is fresh, and if they are
   * stale within `staleWhileRevalidate` window, fetches in the background and
   * updates the cache. Or simply fetches on cache stale or cache miss. During
   * SWR, a successful fetch will not notify cache updates. New contents are
   * served on next query.
   * - `no-store`: Always fetch and does not update on response.
   * GQty creates a temporary cache at query-level which immediately expires.
   * - `no-cache`: Always fetch, updates on response.
   * - `force-cache`: Serves the cached contents regardless of staleness. It
   * fetches on cache miss or a stale cache, updates cache on response.
   * - `only-if-cached`: Serves the cached contents regardless of staleness,
   * throws a network error on cache miss.
   *
   * _It takes effort to make sure the above stays true for all supported
   * frameworks, please consider sponsoring so we can dedicate even more time on
   * this._
   */
  fetchPolicy?: FetchOptions['cachePolicy'];

  retryPolicy?: FetchOptions['retryPolicy'];

  /**
   * Intercept errors thrown from the underlying subscription client or query
   * fetcher.
   *
   * If omitted, the `subscribe()` generator throws and closes on the first
   * error, terminating other active subscriptions triggered from the same
   * selections.
   */
  onError?: (error: unknown) => void;

  onSelect?: NonNullable<SchemaContext['onSelect']>;

  /**
   * Called when a subscription is established, receives an unsubscribe
   * function that immediately terminates the async generator and any pending
   * promise.
   */
  onSubscribe?: (unsubscribe: () => void) => void;

  operationName?: string;
};

export const createResolvers = <TSchema extends BaseGeneratedSchema>({
  cache: clientCache,
  debugger: debug,
  depthLimit,
  fetchOptions,
  fetchOptions: {
    cachePolicy: defaultFetchPolicy = 'default',
    retryPolicy: defaultRetryPoliy,
  },
  scalars,
  schema,
  parentContext,
}: CreateResolversOptions): Resolvers<TSchema> => {
  const createResolver = ({
    fetchPolicy = defaultFetchPolicy,
    onSelect,
    onSubscribe,
    operationName,
    retryPolicy = defaultRetryPoliy,
  }: SubscribeOptions = {}) => {
    const selections = new Set<Selection>();
    const context = createContext({
      cache: clientCache,
      depthLimit,
      cachePolicy: fetchPolicy,
      onSelect(selection, cache) {
        // Prevents infinite loop created by legacy functions
        if (!selections.has(selection)) {
          selections.add(selection);
          parentContext?.onSelect(selection, cache);
        }

        onSelect?.(selection, cache);
      },
      scalars,
      schema,
    });
    const accessor = createSchemaAccessor<TSchema>(context);

    const resolve = async () => {
      if (!context.shouldFetch) return;

      if (fetchPolicy === 'only-if-cached') {
        // Mimic fetch error in the Chromium/WebKit monopoly
        throw new TypeError('Failed to fetch');
      }

      return fetchSelections(selections, {
        cache: context.cache,
        debugger: debug,
        fetchOptions: {
          ...fetchOptions,
          cachePolicy: fetchPolicy,
          retryPolicy,
        },
        operationName,
      }).then((results) => {
        updateCaches(
          results,
          fetchPolicy !== 'no-store' && context.cache !== clientCache
            ? [context.cache, clientCache]
            : [context.cache],
          { skipNotify: !context.notifyCacheUpdate }
        );

        return results;
      });
    };

    const subscribe = ({
      onComplete,
      onError,
      onNext,
    }: Parameters<
      ReturnType<CreateResolverFn<TSchema>>['subscribe']
    >[0] = {}) => {
      const unsubscibers = new Set<() => void>();
      const unsubscribe = () => {
        for (const unsubscribe of unsubscibers) {
          unsubscribe();
        }
      };

      // Subscribe to cache changes, re-rendering is triggered separately from
      // the actual fetch / subscription.
      if (onNext) {
        const unsubscribe = context.cache.subscribe(
          [...selections].map((s) => s.cacheKeys.join('.')),
          (data) => onNext({ data })
        );

        unsubscibers.add(unsubscribe);
      }

      const subscriptionSelections = new Set<Selection>();
      const promises: Promise<unknown>[] = [];

      // fetch query and mutation.
      if (context.shouldFetch) {
        // resolve() takes the original set, remove subscriptions from it.
        for (const selection of selections) {
          if (selection.root.key === 'subscription') {
            selections.delete(selection);
            subscriptionSelections.add(selection);
          }
        }

        promises.push(resolve());
      }

      // Add it back, subscribe() AsyncGenerator needs it.
      for (const selection of subscriptionSelections) {
        selections.add(selection);
      }

      // Subscriptions should disregard context.shouldFetch(), always subscribe
      // for changes.
      {
        const promise = new Promise<void>((resolve, reject) => {
          const unsubscribe: Unsubscribe = subscribeSelections(
            subscriptionSelections,
            ({ data, error, extensions }) => {
              if (error) {
                onError?.(error);

                // Discard data here because of how generators work
                if (data !== undefined) {
                }

                reject(error);
              } else if (data !== undefined) {
                updateCaches(
                  [{ data, error, extensions }],
                  fetchPolicy !== 'no-store' && context.cache !== clientCache
                    ? [context.cache, clientCache]
                    : [context.cache],
                  { skipNotify: !context.notifyCacheUpdate }
                );
              } else {
                // Fetches responded, subscriptions closed, but cache subscription is
                // still active.
              }
            },
            {
              cache: context.cache,
              debugger: debug,
              fetchOptions: {
                ...fetchOptions,
                cachePolicy: fetchPolicy,
                retryPolicy,
              },
              operationName,
              onSubscribe: () => onSubscribe?.(unsubscribe),
              onComplete: () => resolve(),
            }
          );

          unsubscibers.add(unsubscribe);
        });

        promises.push(promise);
      }

      Promise.allSettled(promises).finally(onComplete);

      return unsubscribe;
    };

    return { accessor, context, resolve, selections, subscribe };
  };

  return {
    createResolver,

    resolve: async (fn, options) => {
      const { accessor, resolve, selections } = createResolver(options);

      fn(accessor) as unknown;

      const dataFn = () =>
        ((fn(accessor) as unknown) ?? pick(accessor, selections)) as any;

      const fetchPromise = resolve().then(dataFn);

      if (options?.awaitsFetch ?? true) {
        return fetchPromise;
      }

      options?.onFetch?.(fetchPromise);

      return dataFn();
    },

    subscribe: (fn, { onSubscribe, ...options } = {}): AsyncGenerator<any> => {
      const { accessor, selections, subscribe } = createResolver({
        ...options,
        onSubscribe: (unsubscribe) => {
          onSubscribe?.(() => {
            unsubscribe();
            done = true;
            deferred?.resolve();
          });
        },
      });

      fn(accessor);

      const unsubscribe = subscribe({
        onError: (error) => {
          rejected = error;
          deferred?.reject(error);
        },
        onNext(value) {
          pending.push((fn(accessor) as any) ?? (value as any));
          deferred?.resolve();
        },
      });

      // Assuming child selections are cached and reused in subsequent
      // selections, otherwise uncomment the following line to prevent
      // excessive duplicated selections.
      //context.onSelect = undefined;

      let deferred:
        | {
            resolve: () => void;
            reject: (err: unknown) => void;
          }
        | undefined;
      let rejected: unknown;
      let done = false;
      const pending = [] as unknown[];

      if (selections.size === 0) {
        done = true;
      }

      return {
        [Symbol.asyncIterator]() {
          return this;
        },
        async next() {
          if (rejected !== undefined) {
            throw rejected;
          } else if (done) {
            return asyncItDoneMessage;
          } else if (pending.length > 0) {
            return { value: pending.shift()! };
          } else {
            await new Promise<void>((resolve, reject) => {
              deferred = { resolve, reject };
            });

            return this.next();
          }
        },
        async throw(error) {
          throw error;
        },
        async return() {
          unsubscribe();
          return asyncItDoneMessage;
        },
      };
    },
  };
};
