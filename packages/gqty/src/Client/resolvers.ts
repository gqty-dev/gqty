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
   * Calling `.return()` does not terminate pending promise. Use the `signal`
   * option to exist the generator without waiting for the next update.
   */
  subscribe: SubscribeFn<TSchema>;
};

export type CreateResolverFn<TSchema extends BaseGeneratedSchema> = (
  options?: ResolveOptions
) => {
  accessor: TSchema;
  context: SchemaContext;
  resolve: () => Promise<void>;
  selections: Set<Selection>;
};

export type CreateSubscriberFn<TSchema extends BaseGeneratedSchema> = (
  options?: SubscribeOptions
) => {
  accessor: TSchema;
  context: SchemaContext;
  selections: Set<Selection>;
  subscribe: (callbacks: {
    onError: (error: Error | GQtyError) => void;
    onNext: (value: unknown) => void;
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

  onFetch?: (fetchPromise: Promise<unknown>) => void;

  onSelect?: NonNullable<SchemaContext['onSelect']>;

  operationName?: string;
};

export type SubscribeOptions = {
  fetchPolicy?: FetchOptions['fetchPolicy'];

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

  operationName?: string;

  /**
   * Interrupts the pending promise and exists the generator.
   */
  signal?: AbortSignal;
};

export const createResolvers = <TSchema extends BaseGeneratedSchema>({
  cache: clientCache,
  debugger: debug,
  depthLimit,
  fetchOptions,
  fetchOptions: { fetchPolicy: defaultFetchPolicy = 'default' },
  scalars,
  schema,
}: CreateResolversOptions): Resolvers<TSchema> => {
  const createResolver = ({
    awaitsFetch = true,
    fetchPolicy = defaultFetchPolicy ?? 'default',
    operationName,
    onFetch,
    onSelect,
  }: ResolveOptions = {}) => {
    const selections = new Set<Selection>();
    const context = createContext({
      cache: clientCache,
      depthLimit,
      fetchPolicy,
      onSelect(selection, cache) {
        selections.add(selection);
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
      const fetchPromises = fetchSelections(selections, {
        debugger: debug,
        fetchOptions,
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

      if (awaitsFetch) {
        await fetchPromises;
      } else {
        onFetch?.(fetchPromises);
      }
    };

    return { accessor, context, resolve, selections };
  };

  const createSubscriber = ({
    fetchPolicy = defaultFetchPolicy,
    onSelect,
    operationName,
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
      onError: (error: Error | GQtyError) => void;
      onNext: (value: unknown) => void;
    }) => {
      const unsubscribeCache = context.cache.subscribe(
        [...selections].map(({ cacheKeys }) => cacheKeys.join('.')),
        onNext
      );

      const unsubscribeSelections = subscribeSelections(
        selections,
        ({ data, error, extensions }) => {
          if (error) {
            onError(error);

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
          fetchOptions,
          operationName,
        }
      );

      return () => {
        unsubscribeCache();
        unsubscribeSelections();
      };
    };

    return { accessor, context, selections, subscribe };
  };

  return {
    createResolver,
    createSubscriber,

    resolve: async (fn, options) => {
      const { accessor, resolve, selections } = createResolver(options);

      fn(accessor) as unknown;

      await resolve();

      return ((fn(accessor) as unknown) ?? pick(accessor, selections)) as any;
    },
    /**
     * Initiates selected queries, mutations and subscriptions, then subscribes
     * to caches changes until the generator is closed.
     */
    subscribe: (fn, options): AsyncGenerator<any> => {
      const { accessor, selections, subscribe } = createSubscriber(options);

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

      options?.signal?.addEventListener('abort', () => {
        done = true;
        deferred?.resolve();
      });

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
