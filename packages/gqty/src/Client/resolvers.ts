import type { BaseGeneratedSchema, FetchOptions } from '.';
import { createSchemaAccessor } from '../Accessor';
import type { Cache } from '../Cache';
import type { GQtyError } from '../Error';
import type { ScalarsEnumsHash, Schema } from '../Schema';
import type { Selection } from '../Selection';
import { pick } from '../Utils/pick';
import { createContext, SchemaContext } from './context';
import type { Debugger } from './debugger';
import { fetchSelections, subscribeSelections } from './resolveSelections';
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
  /** Create parts used by `resolve()`, useful for deferring fetches. */
  createResolver: CreateResolverFn<TSchema>;

  /** Create parts used by `subscribe()`, useful for deferring subscriptions. */
  createSubscriber: CreateSubscriberFn<TSchema>;

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
};

export type CreateSubscriberFn<TSchema extends BaseGeneratedSchema> = (
  options?: SubscribeOptions
) => {
  accessor: TSchema;
  context: SchemaContext;
  selections: Set<Selection>;
  subscribe: (callbacks?: {
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
  fetchPolicy?: FetchOptions['fetchPolicy'];

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
  fetchPolicy?: FetchOptions['fetchPolicy'];

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
    fetchPolicy: defaultFetchPolicy = 'default',
    retryPolicy: defaultRetryPoliy,
  },
  scalars,
  schema,
  parentContext,
}: CreateResolversOptions): Resolvers<TSchema> => {
  const createResolver = ({
    fetchPolicy = defaultFetchPolicy ?? 'default',
    operationName,
    onSelect,
    retryPolicy = defaultRetryPoliy,
  }: ResolveOptions = {}) => {
    const selections = new Set<Selection>();
    const context = createContext({
      cache: clientCache,
      depthLimit,
      fetchPolicy,
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
        debugger: debug,
        fetchOptions: { ...fetchOptions, fetchPolicy, retryPolicy },
        operationName,
      })
        .then((results) => {
          updateCaches(
            results,
            fetchPolicy !== 'no-store' && context.cache !== clientCache
              ? [context.cache, clientCache]
              : [context.cache],
            { skipNotify: !context.notifyCacheUpdate }
          );

          return results;
        })
        .finally(() => {
          selections.clear();
        });
    };

    return { accessor, context, resolve, selections };
  };

  const createSubscriber = ({
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
      fetchPolicy,
      onSelect(selection, cache) {
        onSelect?.(selection, cache);
        selections.add(selection);
      },
      scalars,
      schema,
    });
    const accessor = createSchemaAccessor<TSchema>(context);

    const subscribe = ({
      onError,
      onNext,
    }: {
      onError?: (error: Error | GQtyError) => void;
      onNext?: (value: unknown) => void;
    } = {}) => {
      const unsubscibers = new Set<() => void>();
      const unsubscribe = () => {
        for (const unsubscribe of unsubscibers) {
          unsubscribe();
        }
      };

      if (onNext) {
        const unsub = context.cache.subscribe(
          [...selections].map(({ cacheKeys }) => cacheKeys.join('.')),
          onNext
        );

        unsubscibers.add(unsub);
      }

      const unsub = subscribeSelections(
        selections,
        ({ data, error, extensions }) => {
          if (error) {
            onError?.(error);

            // Discard data here because of how generators work
            if (data !== undefined) {
            }
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
          debugger: debug,
          fetchOptions: { ...fetchOptions, fetchPolicy, retryPolicy },
          operationName,
          onSubscribe() {
            onSubscribe?.(unsubscribe);
          },
        }
      );

      unsubscibers.add(unsub);

      return unsubscribe;
    };

    return { accessor, context, selections, subscribe };
  };

  return {
    createResolver,
    createSubscriber,

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
    /**
     * Initiates selected queries, mutations and subscriptions, then subscribes
     * to caches changes until the generator is closed.
     */
    subscribe: (fn, { onSubscribe, ...options } = {}): AsyncGenerator<any> => {
      const { accessor, selections, subscribe } = createSubscriber({
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

      // Assuming selections are cached, otherwise uncomment the following line.
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
