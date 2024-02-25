import { type BaseGeneratedSchema, type FetchOptions } from '.';
import { createSchemaAccessor } from '../Accessor';
import { type Cache } from '../Cache';
import { type GQtyError, type RetryOptions } from '../Error';
import { type ScalarsEnumsHash, type Schema } from '../Schema';
import { type Selection } from '../Selection';
import { addSelections, delSelectionSet, getSelectionsSet } from './batching';
import { createContext, type SchemaContext } from './context';
import { type Debugger } from './debugger';
import {
  fetchSelections,
  subscribeSelections,
  type Unsubscribe,
} from './resolveSelections';
import { updateCaches } from './updateCaches';

export type CreateResolversOptions = {
  aliasLength?: number;
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

export type ResolverParts<TSchema extends BaseGeneratedSchema> = {
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

export type CreateResolverFn<TSchema extends BaseGeneratedSchema> = (
  options?: ResolveOptions
) => ResolverParts<TSchema>;

export type ResolveFn<TSchema extends BaseGeneratedSchema> = <
  TData extends unknown = unknown
>(
  fn: DataFn<TSchema, TData>,
  options?: ResolveOptions
) => Promise<TData>;

const asyncItDoneMessage = { done: true } as IteratorResult<never>;

export type SubscribeFn<TSchema extends BaseGeneratedSchema> = <
  TData extends unknown = unknown
>(
  fn: DataFn<TSchema, TData>,
  options?: SubscribeOptions
) => AsyncGenerator<TData, void, unknown> & {
  unsubscribe: Unsubscribe;
};

export type DataFn<TSchema, TResult = unknown> = (schema: TSchema) => TResult;

export type CreateResolverOptions = {
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
  cachePolicy?: RequestCache;

  /** Custom GraphQL extensions to be exposed to the query fetcher. */
  extensions?: Record<string, unknown>;

  retryPolicy?: RetryOptions;

  onSelect?: SchemaContext['select'];

  operationName?: string;
};

export type ResolveOptions = CreateResolverOptions & {
  /**
   * Awaits resolution it the query results in a fetch. Specify `false` to
   * immediately return the current cache, placeholder data will be returned on
   * a partial or complete cache miss.
   *
   * @default true
   */
  awaitsFetch?: boolean;

  onFetch?: (fetchPromise: Promise<unknown>) => void;
};

export type SubscribeOptions = CreateResolverOptions & {
  /**
   * Intercept errors thrown from the underlying subscription client or query
   * fetcher.
   *
   * If omitted, the `subscribe()` generator throws and closes on the first
   * error, terminating other active subscriptions triggered from the same
   * selections.
   */
  onError?: (error: unknown) => void;

  /**
   * Called when a subscription is established, receives an unsubscribe
   * function that immediately terminates the async generator and any pending
   * promise.
   */
  onSubscribe?: (unsubscribe: Unsubscribe) => void;
};

/**
 * A client level query batcher.
 */
const pendingQueries = new WeakMap<Set<Set<Selection>>, Promise<unknown>>();

export const createResolvers = <TSchema extends BaseGeneratedSchema>({
  aliasLength,
  cache: clientCache,
  debugger: debug,
  depthLimit,
  fetchOptions,
  fetchOptions: {
    cachePolicy: defaultCachePolicy = 'default',
    retryPolicy: defaultRetryPoliy,
  },
  scalars,
  schema,
  parentContext,
}: CreateResolversOptions): Resolvers<TSchema> => {
  const createResolver = ({
    cachePolicy = defaultCachePolicy,
    extensions,
    onSelect,
    onSubscribe,
    operationName,
    retryPolicy = defaultRetryPoliy,
  }: SubscribeOptions = {}) => {
    const selections = new Set<Selection>();
    const context = createContext({
      aliasLength,
      cache: clientCache,
      depthLimit,
      cachePolicy,
      scalars,
      schema,
    });

    context.subscribeSelect((selection, cache) => {
      if (false === onSelect?.(selection, cache)) {
        return;
      }

      // Prevents infinite loop created by legacy functions
      if (!selections.has(selection)) {
        selections.add(selection);
        parentContext?.select(selection, cache);
      }
    });

    const accessor = createSchemaAccessor<TSchema>(context);

    const resolve: ResolverParts<TSchema>['resolve'] = async () => {
      if (selections.size === 0) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(
            '[GQty] No selections found. If you are reading from the ' +
              'global accessors, try using the first argument instead.'
          );
        }

        return;
      }

      if (!context.shouldFetch) return;

      if (cachePolicy === 'only-if-cached') {
        // Mimic fetch error in the Chromium/WebKit monopoly
        throw new TypeError('Failed to fetch');
      }

      // Batch selections up at client level, fetch all of them "next tick".
      const selectionsCacheKey = `${cachePolicy}/${operationName ?? ''}`;

      const pendingSelections = addSelections(
        clientCache,
        selectionsCacheKey,
        selections
      );

      if (!pendingQueries.has(pendingSelections)) {
        pendingQueries.set(
          pendingSelections,
          // Batching happens at the end of microtask queue
          Promise.resolve().then(async () => {
            const uniqueSelections = new Set<Selection>();

            getSelectionsSet(clientCache, selectionsCacheKey)?.forEach(
              (selections) => {
                selections.forEach((selection) => {
                  uniqueSelections.add(selection);
                });
              }
            );

            pendingQueries.delete(pendingSelections);

            delSelectionSet(clientCache, selectionsCacheKey);

            const results = await fetchSelections(uniqueSelections, {
              cache: context.cache,
              debugger: debug,
              extensions,
              fetchOptions: { ...fetchOptions, cachePolicy, retryPolicy },
              operationName,
            });

            updateCaches(
              results,
              cachePolicy !== 'no-store' && context.cache !== clientCache
                ? [context.cache, clientCache]
                : [context.cache],
              { skipNotify: !context.notifyCacheUpdate }
            );

            return results;
          })
        );
      }

      return pendingQueries.get(pendingSelections)!;
    };

    const subscribe: ResolverParts<TSchema>['subscribe'] = ({
      onComplete,
      onError,
      onNext,
    } = {}) => {
      if (selections.size === 0) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(
            '[GQty] No selections found. If you are reading from the ' +
              'global accessors, try using the first argument instead.'
          );
        }

        return () => {
          // noop
        };
      }

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
        // resolve() directly processes the selections set, remove subscription
        // selections before calling it, we handle subscription differently
        // below.
        for (const selection of selections) {
          if (selection.root.key === 'subscription') {
            selections.delete(selection);
            subscriptionSelections.add(selection);
          }
        }

        if (selections.size > 0) {
          promises.push(resolve());
        }
      }

      // Add subscription selections back after resolve(), the subscribe()
      // AsyncGenerator needs it.
      for (const selection of subscriptionSelections) {
        selections.add(selection);
      }

      // Subscriptions ignore shouldFetch, always subscribe for changes.
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
                  cachePolicy !== 'no-store' && context.cache !== clientCache
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
              extensions,
              fetchOptions: {
                ...fetchOptions,
                cachePolicy,
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
      const { accessor, resolve } = createResolver(options);
      const dataFn = () => fn(accessor);

      // Run once to trigger selections
      dataFn();

      const fetchPromise = resolve().then(dataFn);

      if (options?.awaitsFetch ?? true) {
        return fetchPromise;
      }

      options?.onFetch?.(fetchPromise);

      return dataFn();
    },

    subscribe: (
      fn,
      { onSubscribe, ...options } = {}
    ): AsyncGenerator<any> & { unsubscribe: Unsubscribe } => {
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
        [Symbol.asyncIterator]() {
          return this;
        },
        unsubscribe,
      };
    },
  };
};
