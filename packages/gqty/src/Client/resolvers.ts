import { debounceMicrotaskPromise } from 'debounce-microtasks';
import { MultiDict } from 'multidict';
import type { BaseGeneratedSchema, FetchOptions } from '.';
import { createSchemaAccessor } from '../Accessor';
import type { Cache } from '../Cache';
import type { GQtyError, RetryOptions } from '../Error';
import type { ScalarsEnumsHash, Schema } from '../Schema';
import type { Selection } from '../Selection';
import { createDeferredIterator } from '../Utils/deferred';
import { pick } from '../Utils/pick';
import { addSelections, delSelectionSet, getSelectionsSet } from './batching';
import { createContext, type SchemaContext } from './context';
import type { Debugger } from './debugger';
import {
  fetchSelections,
  subscribeSelections,
  type Unsubscribe,
} from './resolveSelections';
import { updateCaches } from './updateCaches';

export type CreateResolversOptions = {
  aliasLength?: number;
  batchWindow?: number;
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

export type ResolveFn<TSchema extends BaseGeneratedSchema> = <TData = unknown>(
  fn: DataFn<TSchema, TData>,
  options?: ResolveOptions
) => Promise<TData>;

export type SubscribeFn<TSchema extends BaseGeneratedSchema> = <
  TData = unknown,
>(
  fn: DataFn<TSchema, TData>,
  options?: SubscribeOptions
) => AsyncIterableIterator<TData> & {
  unsubscribe: Unsubscribe;
};

export type DataFn<TSchema, TResult = unknown> = (schema: TSchema) => TResult;

export type ResolverOptions = {
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

  /** Retry strategy upon fetch failure. */
  retryPolicy?: RetryOptions;

  onSelect?: SchemaContext['select'];

  operationName?: string;
};

export type ResolveOptions = ResolverOptions & {
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

export type SubscribeOptions = ResolverOptions & {
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
const pendingQueries = new WeakMap<
  Set<Set<Selection>>,
  () => Promise<unknown>
>();

const getInteraction = <T>(subject: Set<T>, object: Set<T>) => {
  const interaction = new Set<T>();

  for (const item of object) {
    if (subject.has(item)) {
      interaction.add(item);
    }
  }

  return interaction;
};

export const createResolvers = <TSchema extends BaseGeneratedSchema>({
  aliasLength,
  batchWindow,
  cache: targetCache,
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
  // A temporary cache is created by the resolver context for these cache
  // policies: no-cache, no-store.
  //
  // When multiple queries are batched, all corresponding temporary caches must
  // be updated. Along with the original client cache.
  const correlatedCaches = new MultiDict<Set<unknown>, Cache>();

  const createResolver = ({
    cachePolicy = defaultCachePolicy,
    extensions,
    onSelect,
    onSubscribe,
    operationName,
    retryPolicy = defaultRetryPoliy,
  }: SubscribeOptions = {}) => {
    // The selection set after a successful resolution of `resolve()` or
    // the first data returned from `subscribe()`.
    let prevSelections = new Set<Selection>();

    const selections = new Set<Selection>();
    const context = createContext({
      aliasLength,
      cache: targetCache,
      depthLimit,
      cachePolicy,
      scalars,
      schema,
    });

    context.subscribeSelect((selection, cache) => {
      if (false === onSelect?.(selection, cache)) {
        return;
      }

      const targetSelections =
        cache?.data === null ||
        (Array.isArray(cache?.data) && cache.data.length === 0)
          ? // For empty arrays and null objects, trigger sub-selections made
            // in previous selections.
            getInteraction(selection.getLeafNodes(), prevSelections)
          : [selection];

      for (const selection of targetSelections) {
        if (!selections.has(selection)) {
          selections.add(selection);

          // The `has` check above prevents infinite loop created by legacy
          // functions.
          parentContext?.select(selection, cache);
        }
      }
    });

    const { accessor } = createSchemaAccessor<TSchema>(context);

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

      // Batch selections up at client level, fetch all of them at the next idle
      // microtask where no more selections are made.
      // 1. Query with operation names are never batched up with others.
      // 2. 'no-store' queries are tracked separately because its data is not
      // going into the main cache.
      const selectionsCacheKey = `${operationName ?? (cachePolicy === 'no-store' ? 'no-store' : 'default')}`;

      const pendingSelections = addSelections(
        targetCache,
        selectionsCacheKey,
        selections
      );

      // Link temporary caches together
      correlatedCaches.set(pendingSelections, context.cache);

      if (!pendingQueries.has(pendingSelections)) {
        pendingQueries.set(
          pendingSelections,
          // Batching happens at the end of microtask queue
          debounceMicrotaskPromise(
            async () => {
              // Have to skip this await when not set, because a 0 timeout still
              // unnecessarily pushed it back at least one more mictotask.
              if (batchWindow) {
                await new Promise((resolve) =>
                  setTimeout(resolve, batchWindow)
                );
              }

              const uniqueSelections = new Set<Selection>();

              getSelectionsSet(targetCache, selectionsCacheKey)?.forEach(
                (selections) => {
                  selections.forEach((selection) => {
                    uniqueSelections.add(selection);
                  });
                }
              );

              pendingQueries.delete(pendingSelections);

              delSelectionSet(targetCache, selectionsCacheKey);

              const results = await fetchSelections(uniqueSelections, {
                cache: context.cache,
                debugger: debug,
                extensions,
                fetchOptions: { ...fetchOptions, cachePolicy, retryPolicy },
                operationName,
              });

              const targetCaches =
                correlatedCaches.get(pendingSelections) ?? new Set();

              if (cachePolicy !== 'no-store') {
                targetCaches.add(targetCache);
              }

              updateCaches(results, [...targetCaches], {
                skipNotify: !context.notifyCacheUpdate,
              });

              correlatedCaches.delete(targetCache);

              return results;
            },
            {
              debounceLimit: 20,
              limitAction: 'invoke',
            }
          )
        );

        // Post-fetch actions scoped to this context
        pendingQueries.get(pendingSelections)!()
          .then(
            () => {
              // Stores selections for the next batch
              prevSelections = new Set(selections);

              // Clear current selections to drop potentially stale inputs
              selections.clear();
            },
            () => {
              // Swallow errors
            }
          )
          .finally(() => {
            // Reset the flag after fetch
            context.shouldFetch = false;
          });
      }

      return pendingQueries.get(pendingSelections)!();
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
          promises.push(resolve().catch(onError));
        }
      }

      // Add subscription selections back after resolve(), the subscribe()
      // AsyncGenerator needs it.
      for (const selection of subscriptionSelections) {
        selections.add(selection);
      }

      // Subscriptions ignore shouldFetch, always subscribe for changes.
      {
        let prevSelectionsUpdated = false;

        const promise = new Promise<void>((resolve, reject) => {
          const unsubscribe: Unsubscribe = subscribeSelections(
            subscriptionSelections,
            ({ data, error, extensions }) => {
              if (error) {
                onError?.(error);

                // Generators do not allow further processing of `data`.
                // if (data !== undefined) {}

                reject(error);
              } else if (data !== undefined) {
                updateCaches(
                  [{ data, error, extensions }],
                  cachePolicy !== 'no-store' && context.cache !== targetCache
                    ? [context.cache, targetCache]
                    : [context.cache],
                  { skipNotify: !context.notifyCacheUpdate }
                );

                if (!prevSelectionsUpdated) {
                  prevSelectionsUpdated = true;

                  prevSelections = new Set(selections);
                }
              } else {
                // Fetches responded, subscriptions closed, but cache
                // subscription is still active.
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
      const { accessor, resolve, selections } = createResolver(options);
      const dataFn = () => fn(accessor);

      // Run once to trigger selections
      dataFn();

      const fetchPromise = resolve().then(dataFn);

      if (options?.awaitsFetch ?? true) {
        await fetchPromise;
      }

      options?.onFetch?.(fetchPromise);

      return dataFn() ?? (pick(accessor, selections) as never);
    },

    subscribe: <TData = unknown>(
      fn: DataFn<TSchema, TData>,
      { onSubscribe, ...options }: SubscribeOptions = {}
    ): AsyncIterableIterator<TData> & { unsubscribe: Unsubscribe } => {
      const { accessor, selections, subscribe } = createResolver({
        ...options,
        onSubscribe: (unsubscribe) => {
          onSubscribe?.(() => {
            unsubscribe();
            observable.complete();
          });
        },
      });

      fn(accessor);

      const unsubscribe = subscribe({
        onError: (error) => {
          if (observable.throw === undefined) {
            throw error;
          }

          observable.throw(error);
        },
        onNext(value) {
          const message = fn(accessor) ?? value;

          observable.send(message as TData);
        },
      });

      // Assuming child selections are cached and reused in subsequent
      // selections, otherwise uncomment the following line to prevent
      // excessive duplicated selections.
      //context.onSelect = undefined;

      const observable = createDeferredIterator<TData>();

      if (selections.size === 0) {
        observable.complete();
      }

      return { ...observable, unsubscribe };
    },
  };
};
