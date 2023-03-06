import type { BaseGeneratedSchema, FetchOptions } from '.';
import { createSchemaAccessor } from '../Accessor';
import type { Cache } from '../Cache';
import { GQtyError } from '../Error';
import type { ScalarsEnumsHash, Schema } from '../Schema';
import type { Selection } from '../Selection';
import { pick } from '../Utils/pick';
import { createContext, ResolveContext } from './context';
import type { Debugger } from './debugger';
import { fetchSelections, subscribeSelections } from './resolveSelections';
import { updateCaches } from './updateCaches';

export type CreateResolvedOptions = {
  cache: Cache;
  debugger?: Debugger;
  depthLimit: number;
  fetchOptions: FetchOptions;
  scalars: ScalarsEnumsHash;
  schema: Readonly<Schema>;
};

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

  onSelect?: NonNullable<ResolveContext['onSelect']>;

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

  onSelect?: NonNullable<ResolveContext['onSelect']>;

  operationName?: string;

  /**
   * Interrupts the pending promise and exists the generator.
   */
  signal?: AbortSignal;
};

export type ResolveFn<TSchema extends BaseGeneratedSchema> = <
  TData extends Record<string, unknown> = Record<string, unknown>
>(
  fn: DataFn<TSchema>,
  options?: ResolveOptions
) => Promise<TData> | TData;

const asyncItDoneMessage = { done: true } as IteratorResult<never>;

export type SubscribeFn<TSchema extends BaseGeneratedSchema> = <
  TData extends Record<string, unknown> = Record<string, unknown>
>(
  fn: DataFn<TSchema>,
  options?: SubscribeOptions
) => AsyncGenerator<TData, void, unknown>;

export const createResolvers = <TSchema extends BaseGeneratedSchema>({
  cache: clientCache,
  debugger: debug,
  depthLimit,
  fetchOptions,
  fetchOptions: { fetchPolicy: defaultFetchPolicy = 'default' },
  scalars,
  schema,
}: CreateResolvedOptions) => {
  const resolve: ResolveFn<TSchema> = <
    TData extends Record<string, unknown> = Record<string, unknown>
  >(
    fn: DataFn<TSchema>,
    {
      awaitsFetch = true,
      fetchPolicy = defaultFetchPolicy ?? 'default',
      operationName,
      onFetch,
      onSelect,
    }: ResolveOptions = {}
  ): Promise<TData> | TData => {
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

    const compatDataFn = () =>
      // compat: resolved(fn) and inlineResolved(fn) returns accessors
      (fn(accessor) as unknown as TData) ?? pick(accessor, selections);

    const data = compatDataFn();

    if (context.shouldFetch) {
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
        return fetchPromises.then(compatDataFn);
      } else {
        onFetch?.(fetchPromises);
      }
    }

    return data;
  };

  /**
   * Initiates selected queries, mutations and subscriptions, then subscribes
   * to caches changes until the generator is closed.
   */
  const subscribe: SubscribeFn<TSchema> = function subscribe<
    TData extends Record<string, unknown> = Record<string, unknown>
  >(
    fn: DataFn<TSchema>,
    {
      fetchPolicy = defaultFetchPolicy,
      onError,
      onSelect,
      operationName,
      signal,
    }: SubscribeOptions = {}
  ): AsyncGenerator<TData, void, unknown> {
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

    fn(accessor);

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
    const pending = [] as TData[];

    if (selections.size === 0) {
      done = true;
    }

    signal?.addEventListener('abort', () => {
      done = true;
      deferred?.resolve();
    });

    const unsubscribeCache = context.cache.subscribe(
      [...selections].map(({ cacheKeys }) => cacheKeys.join('.')),
      (value) => {
        pending.push((fn(accessor) as any) ?? (value as any));
        deferred?.resolve();
      }
    );

    const unsubscribeSelections = subscribeSelections(
      selections,
      ({ data, errors, extensions }) => {
        if (errors) {
          const error =
            errors.length > 1
              ? GQtyError.fromGraphQLErrors(errors)
              : errors.length === 1
              ? errors[0]
              : new GQtyError('Subscription thrown an unknown error.');

          if (onError) {
            onError(error);
          } else {
            // Discard data here because of how generators work
            if (data !== undefined) {
            }

            rejected = error;
            deferred?.reject(error);
          }
        } else if (data !== undefined) {
          updateCaches(
            [{ data, errors, extensions }],
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
        unsubscribeCache();
        unsubscribeSelections();
        return asyncItDoneMessage;
      },
    };
  };

  return {
    resolve,
    subscribe,
  };
};

// TODO: AbortController#signal aborts query and mutation fetches, if any.
