import type { ExecutionResult, GraphQLError } from 'graphql';
import { CacheInstance, createCache } from '../Cache';
import { GQtyError } from '../Error';
import { doRetry } from '../Error/retry';
import { createQueryBuilder } from '../QueryBuilder';
import {
  createSelectionManager,
  SelectionManager,
  separateSelectionTypes,
} from '../Selection/SelectionManager';
import {
  createDeferredPromise,
  DeferredPromise,
  get,
  LazyPromise,
} from '../Utils';

import type { FetchEventData } from '../Events';
import type { NormalizationHandler } from '../Normalization';
import type { SchedulerPromiseValue } from '../Scheduler';
import type { FetchOptions } from '../Schema/types';
import { Selection, SelectionType } from '../Selection/selection';
import type {
  InnerClientState,
  SubscribeEvents,
  SubscriptionsClient,
} from './client';

export interface ResolveOptions<TData> {
  /**
   * Set to `true` to refetch the data requirements
   */
  refetch?: boolean;
  /**
   * Ignore the client cache
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
  onSelection?: (selection: Selection) => void;
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
  fetchOptions?: FetchOptions;

  /**
   * Query operation name
   */
  operationName?: string;
}

export type RetryOptions =
  | {
      /**
       * Amount of retries to be made
       * @default 3
       */
      maxRetries?: number;
      /**
       * Amount of milliseconds between each attempt, it can be a static number,
       * or a function based on the attempt number
       *
       * @default attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
       */
      retryDelay?: number | ((attemptIndex: number) => number);
    }
  /** If retries should be enabled
   * @default true
   */
  | boolean
  /** Amount of retries to be made
   * @default 3
   */
  | number;

export interface FetchResolveOptions {
  retry?: RetryOptions;

  scheduler?: boolean;

  ignoreResolveCache?: boolean;

  onSubscription?: ResolveOptions<any>['onSubscription'];

  fetchOptions?: FetchOptions;
}

function filterSelectionsWithErrors(
  graphQLErrors: readonly GraphQLError[] | undefined,
  executionData: Record<string, unknown> | null | undefined,
  selections: Selection[]
) {
  if (!executionData) return selections;

  const gqlErrorsPaths = graphQLErrors
    ?.map((err) =>
      err.path
        ?.filter(
          (pathValue): pathValue is string => typeof pathValue === 'string'
        )
        .join('.')
    )
    .filter(
      (possiblePath): possiblePath is NonNullable<typeof possiblePath> => {
        return !!possiblePath;
      }
    );
  const selectionsWithErrors = !gqlErrorsPaths?.length
    ? selections
    : selections.filter((selection) => {
        const selectionPathNoIndex = selection.noIndexSelections
          .slice(1)
          .map((selection) => selection.alias || selection.key)
          .join('.');
        const selectionData = get(executionData, selectionPathNoIndex);

        switch (selectionData) {
          case undefined: {
            return true;
          }
          case null: {
            return gqlErrorsPaths.includes(selectionPathNoIndex);
          }
          default:
            return false;
        }
      });

  return selectionsWithErrors;
}

export interface Resolved {
  <T = unknown>(dataFn: () => T, opts?: ResolveOptions<T>): Promise<T>;
}

export interface BuildAndFetchSelections {
  <TData = unknown>(
    selections: Selection[] | undefined,
    type: 'query' | 'mutation',
    cache?: CacheInstance,
    options?: FetchResolveOptions,
    lastTry?: boolean | undefined
  ): Promise<TData | undefined>;
}

export interface ResolveSelections {
  (
    selections: Selection[] | Set<Selection>,
    cache?: CacheInstance,
    options?: FetchResolveOptions
  ): Promise<void>;
}

export interface Resolvers {
  resolveSelections: ResolveSelections;
  buildAndFetchSelections: BuildAndFetchSelections;
  resolved: Resolved;
  inlineResolved: InlineResolved;
}

export interface InlineResolved {
  <TData = unknown>(fn: () => TData, options?: InlineResolveOptions<TData>):
    | TData
    | Promise<TData>;
}

export interface InlineResolveOptions<TData> {
  refetch?: boolean;
  onEmptyResolve?: () => void;
  /**
   * Get every selection intercepted in the specified function
   */
  onSelection?: (selection: Selection) => void;
  /**
   * On valid cache data found callback
   */
  onCacheData?: (data: TData) => void;
  /**
   * Query operation name
   */
  operationName?: string;
}

export function createResolvers(
  innerState: InnerClientState,
  catchSelectionsTimeMS: number,
  subscriptions?: SubscriptionsClient
): Resolvers {
  const {
    interceptorManager,
    eventHandler,
    queryFetcher,
    scheduler,
    clientCache: globalCache,
    selectionManager: globalSelectionManager,
    defaults: { resolved: resolvedDefaults = {} },
  } = innerState;
  const { globalInterceptor } = interceptorManager;
  const buildQuery = createQueryBuilder();

  const inlineResolved: InlineResolved = function inlineResolved<
    TData = unknown
  >(
    fn: () => TData,
    {
      refetch,
      onEmptyResolve,
      onSelection,
      onCacheData,
      operationName,
    }: InlineResolveOptions<TData> = {}
  ) {
    const prevFoundValidCache = innerState.foundValidCache;
    innerState.foundValidCache = true;

    const interceptor = interceptorManager.createInterceptor();

    let noSelection = true;
    function onScalarSelection(selection: Selection) {
      selection.operationName = operationName;
      noSelection = false;
    }
    interceptor.selectionAddListeners.add(onScalarSelection);
    interceptor.selectionCacheRefetchListeners.add(onScalarSelection);

    if (onSelection) {
      interceptor.selectionAddListeners.add(onSelection);
      interceptor.selectionCacheListeners.add(onSelection);
      interceptor.selectionCacheRefetchListeners.add(onSelection);
    }

    const prevAllowCache = innerState.allowCache;
    try {
      if (refetch) innerState.allowCache = false;

      const data = fn();

      const foundValidCache = innerState.foundValidCache;

      innerState.allowCache = prevAllowCache;
      innerState.foundValidCache = prevFoundValidCache;
      interceptorManager.removeInterceptor(interceptor);

      if (noSelection) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[gqty] Warning! No data requested.');
        }
        if (onEmptyResolve) onEmptyResolve();
        return data;
      }

      const promises: Promise<SchedulerPromiseValue>[] = [];
      groups: for (const [
        selectionSet,
        promise,
      ] of scheduler.pendingSelectionsGroupsPromises) {
        for (const selection of interceptor.fetchSelections) {
          if (selectionSet.has(selection)) {
            promises.push(promise);
            continue groups;
          }
        }
      }

      if (promises.length) {
        if (foundValidCache) {
          if (onCacheData) {
            onCacheData(data);
          }
        }
        return Promise.all(promises).then((value) => {
          for (const v of value) if (v.error) throw v.error;

          innerState.allowCache = true;

          return fn();
        });
      }

      return data;
    } finally {
      innerState.allowCache = prevAllowCache;
      innerState.foundValidCache = prevFoundValidCache;
      interceptorManager.removeInterceptor(interceptor);
    }
  };

  const {
    noCache: noCacheDefault = false,
    refetch: refetchDefault = false,
    retry: retryDefault = false,
  } = resolvedDefaults;
  const resolved: Resolved = async function resolved<T = unknown>(
    dataFn: () => T,
    {
      refetch = refetchDefault,
      noCache = noCacheDefault,
      onCacheData,
      onSelection,
      onSubscription,
      retry = retryDefault,
      nonSerializableVariables,
      onNoCacheFound,
      onEmptyResolve,
      fetchOptions,
      operationName,
    }: ResolveOptions<T> = {}
  ): Promise<T> {
    const prevFoundValidCache = innerState.foundValidCache;
    innerState.foundValidCache = true;

    let prevAllowCache = innerState.allowCache;
    if (refetch) {
      innerState.allowCache = false;
    }

    let tempCache: typeof innerState.clientCache | undefined;
    if (noCache) {
      innerState.clientCache = tempCache = createCache();
    }

    let tempSelectionManager: SelectionManager | undefined;
    if (nonSerializableVariables) {
      innerState.selectionManager = tempSelectionManager =
        createSelectionManager();
    }

    let prevGlobalInterceptorListening = globalInterceptor.listening;
    globalInterceptor.listening = false;

    const interceptor = interceptorManager.createInterceptor();

    let noSelection = true;

    function onScalarSelection(selection: Selection) {
      selection.operationName = operationName;
      noSelection = false;
    }
    interceptor.selectionAddListeners.add(onScalarSelection);
    interceptor.selectionCacheRefetchListeners.add(onScalarSelection);

    if (onSelection) {
      interceptor.selectionAddListeners.add(onSelection);
      interceptor.selectionCacheListeners.add(onSelection);
      interceptor.selectionCacheRefetchListeners.add(onSelection);
    }

    try {
      const data = dataFn();

      if (noSelection) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[gqty] Warning! No data requested.');
        }
        if (onEmptyResolve) onEmptyResolve();
        return data;
      }

      interceptorManager.removeInterceptor(interceptor);

      if (innerState.foundValidCache) {
        if (onCacheData && !onCacheData(data)) {
          return data;
        }
      } else {
        onNoCacheFound?.();
      }

      innerState.foundValidCache = prevFoundValidCache;
      innerState.allowCache = prevAllowCache;
      innerState.clientCache = globalCache;
      innerState.selectionManager = globalSelectionManager;

      globalInterceptor.listening = prevGlobalInterceptorListening;

      await resolveSelections(
        interceptor.fetchSelections,
        tempCache || innerState.clientCache,
        {
          ignoreResolveCache: refetch || noCache,
          onSubscription: onSubscription
            ? (event) => {
                switch (event.type) {
                  case 'data':
                  case 'with-errors':
                    if (event.data) {
                      const prevAllowCache = innerState.allowCache;
                      try {
                        innerState.allowCache = true;
                        globalInterceptor.listening = false;
                        if (tempCache) {
                          innerState.clientCache = tempCache;
                        }
                        onSubscription({
                          ...event,
                          data: dataFn(),
                        });
                      } finally {
                        innerState.allowCache = prevAllowCache;
                        globalInterceptor.listening = true;
                        innerState.clientCache = globalCache;
                      }
                    } else {
                      onSubscription(event);
                    }
                    return;
                  default:
                    onSubscription(event);
                }
              }
            : undefined,
          retry,
          fetchOptions,
        }
      );

      prevAllowCache = innerState.allowCache;
      innerState.allowCache = true;

      prevGlobalInterceptorListening = globalInterceptor.listening;
      globalInterceptor.listening = false;

      if (tempCache) {
        innerState.clientCache = tempCache;
      }
      if (tempSelectionManager) {
        innerState.selectionManager = tempSelectionManager;
      }

      return dataFn();
    } catch (err) {
      throw GQtyError.create(err, resolved);
    } finally {
      interceptorManager.removeInterceptor(interceptor);
      innerState.allowCache = prevAllowCache;
      innerState.clientCache = globalCache;
      innerState.selectionManager = globalSelectionManager;
      innerState.foundValidCache = prevFoundValidCache;
      globalInterceptor.listening = prevGlobalInterceptorListening;
    }
  };

  const resolutionTempCache = new Map<string, unknown>();
  const resolutionTempCacheTimeout = catchSelectionsTimeMS * 5;

  function buildQueryAndCheckTempCache<TData>(
    selections: Selection[],
    type: 'query' | 'mutation' | 'subscription',
    normalizationHandler: NormalizationHandler | undefined,
    ignoreResolveCache: boolean | undefined,
    isGlobalCache: boolean
  ) {
    const { query, variables, cacheKey } = buildQuery(
      selections,
      {
        type,
      },
      normalizationHandler != null,
      isGlobalCache
    );

    const cachedData = ignoreResolveCache
      ? undefined
      : (resolutionTempCache.get(cacheKey) as TData | undefined);

    return {
      query,
      variables,
      cacheKey,
      cachedData,
    };
  }

  const resolveQueryPromisesMap: Record<string, Promise<any>> = {};

  async function buildAndFetchSelections<TData = unknown>(
    selections: Selection[] | undefined,
    type: 'query' | 'mutation',
    cache: CacheInstance = innerState.clientCache,
    options: FetchResolveOptions = {},
    lastTry?: boolean
  ) {
    if (!selections) return;

    const isLastTry =
      lastTry === undefined ? (options.retry ? false : true) : lastTry;

    const { query, variables, cachedData, cacheKey } =
      buildQueryAndCheckTempCache<TData>(
        selections,
        type,
        innerState.normalizationHandler,
        options.ignoreResolveCache,
        cache === globalCache
      );

    if (!options.scheduler) return resolve();

    let promise: Promise<TData | undefined> | undefined =
      resolveQueryPromisesMap[cacheKey];

    if (promise) return promise;

    promise = LazyPromise(resolve);
    resolveQueryPromisesMap[cacheKey] = promise;

    try {
      return await promise;
    } finally {
      delete resolveQueryPromisesMap[cacheKey];
    }

    async function resolve() {
      if (!selections) return;

      let executionData: ExecutionResult['data'];

      let loggingPromise: DeferredPromise<FetchEventData> | undefined;

      try {
        if (cachedData != null) return cachedData;

        if (eventHandler.hasFetchSubscribers) {
          loggingPromise = createDeferredPromise<FetchEventData>();

          eventHandler.sendFetchPromise(loggingPromise.promise, selections);
        }

        const executionResult = await queryFetcher(
          query,
          variables,
          options.fetchOptions
        );

        const { data, errors } = executionResult;

        if (data) {
          if (!errors && cacheKey) {
            resolutionTempCache.set(cacheKey, data);
            setTimeout(
              () => resolutionTempCache.delete(cacheKey),
              resolutionTempCacheTimeout
            );
          }

          cache.mergeCache(data, type);
          executionData = data;
        }

        if (errors?.length) {
          throw GQtyError.fromGraphQLErrors(errors);
        } else if (options.scheduler) {
          innerState.scheduler.errors.removeErrors(selections);
        }

        loggingPromise?.resolve({
          executionResult,
          query,
          variables,
          cacheSnapshot: cache.cache,
          selections,
          type,
        });

        return data as unknown as TData;
      } catch (err) {
        const error = GQtyError.create(err, () => {});
        loggingPromise?.resolve({
          error,
          query,
          variables,
          cacheSnapshot: cache.cache,
          selections,
          type,
        });

        if (options.scheduler) {
          const selectionsWithErrors = filterSelectionsWithErrors(
            error.graphQLErrors,
            executionData,
            selections
          );
          innerState.scheduler.errors.triggerError(
            error,
            selectionsWithErrors,
            isLastTry
          );
        }

        if (options.retry) {
          async function retryFn(lastTry: boolean) {
            const retryPromise: Promise<SchedulerPromiseValue> =
              buildAndFetchSelections(
                selections,
                type,
                cache,
                Object.assign({}, options, {
                  retry: false,
                  ignoreResolveCache: true,
                } as FetchResolveOptions),
                lastTry
              ).then(
                (data) => ({ data, selections: new Set(selections) }),
                (err) => {
                  console.error(err);
                  return {
                    error: GQtyError.create(err),
                    selections: new Set(selections),
                  };
                }
              );

            if (options.scheduler) {
              const setSelections = new Set(selections);
              scheduler.pendingSelectionsGroups.add(setSelections);

              scheduler.errors.retryPromise(retryPromise, setSelections);

              retryPromise.finally(() => {
                scheduler.pendingSelectionsGroups.delete(setSelections);
              });
            }

            const { error } = await retryPromise;

            if (error) throw error;
          }
          doRetry(options.retry, {
            onLastTry() {
              return retryFn(true);
            },
            onRetry() {
              return retryFn(false);
            },
          });
        }

        throw error;
      } finally {
        interceptorManager.removeSelections(selections);
      }
    }
  }

  function subscriptionSchedulerEvents(ctx: {
    selections: Selection[];
    query: string;
    variables: Record<string, unknown> | undefined;
    operationId: string;
  }): SubscribeEvents {
    return {
      onData(data) {
        const { selections, query, operationId, variables } = ctx;
        globalCache.mergeCache(data, 'subscription');
        scheduler.errors.removeErrors(selections);
        for (const selection of selections) {
          eventHandler.sendCacheChange({
            data,
            selection,
          });
        }
        if (eventHandler.hasFetchSubscribers) {
          eventHandler.sendFetchPromise(
            Promise.resolve({
              executionResult: {
                data,
              },
              cacheSnapshot: globalCache.cache,
              query,
              variables,
              selections,
              type: 'subscription',
              label: `[id=${operationId}] [data]`,
            }),
            selections
          );
        }
      },
      onError({ data, error }) {
        const { query, variables, selections, operationId } = ctx;
        if (data) globalCache.mergeCache(data, 'subscription');

        scheduler.errors.triggerError(
          error,
          filterSelectionsWithErrors(error.graphQLErrors, data, selections),
          true
        );

        if (eventHandler.hasFetchSubscribers) {
          eventHandler.sendFetchPromise(
            Promise.resolve({
              executionResult: {
                data,
              },
              error,
              cacheSnapshot: globalCache.cache,
              query,
              variables,
              selections,
              type: 'subscription',
              label: `[id=${operationId}] [error]`,
            }),
            selections
          );
        }
      },
    };
  }

  async function buildAndSubscribeSelections<TData = unknown>(
    selections: Selection[] | undefined,
    cache: CacheInstance = innerState.clientCache,
    options: FetchResolveOptions
  ) {
    if (!selections) return;

    if (!subscriptions) {
      if (typeof window !== 'undefined') {
        console.error('ERROR: No subscriptions client specified!');
      }
      return;
    }

    const selectionsByRoot = new Map<Selection, Array<Selection>>();

    for (const selection of selections) {
      const root = selection.selectionsList[1];
      // This case realistically should never happen
      /* istanbul ignore next */
      if (!root) continue;

      let selectionSet = selectionsByRoot.get(root);
      if (selectionSet) {
        selectionSet.push(selection);
      } else {
        selectionSet = [selection];
        selectionsByRoot.set(root, selectionSet);
      }
    }

    const unsubscribeCallbacks = new Set<() => Promise<void>>();
    const unsubscribe = async () => {
      await Promise.all(Array.from(unsubscribeCallbacks).map((cb) => cb()));
    };

    for (const selections of selectionsByRoot.values()) {
      const { query, variables, cacheKey } = buildQueryAndCheckTempCache<TData>(
        selections,
        'subscription',
        innerState.normalizationHandler,
        true,
        cache === globalCache
      );

      let operationId: string;
      const subResult = subscriptions.subscribe({
        query,
        variables,
        selections,
        cacheKey,
        events: options.scheduler
          ? subscriptionSchedulerEvents
          : {
              onData(data) {
                cache.mergeCache(data, 'subscription');

                options.onSubscription?.({
                  type: 'data',
                  unsubscribe,
                  data,
                });
                if (eventHandler.hasFetchSubscribers) {
                  eventHandler.sendFetchPromise(
                    Promise.resolve({
                      executionResult: {
                        data,
                      },
                      cacheSnapshot: globalCache.cache,
                      query,
                      variables,
                      selections,
                      type: 'subscription',
                      label: `[id=${operationId}] [data]`,
                    }),
                    selections
                  );
                }
              },
              onError({ data, error }) {
                if (data) cache.mergeCache(data, 'subscription');

                options.onSubscription?.({
                  type: 'with-errors',
                  unsubscribe,
                  data,
                  error,
                });

                if (eventHandler.hasFetchSubscribers) {
                  eventHandler.sendFetchPromise(
                    Promise.resolve({
                      executionResult: {
                        data,
                      },
                      error,
                      cacheSnapshot: globalCache.cache,
                      query,
                      variables,
                      selections,
                      type: 'subscription',
                      label: `[id=${operationId}] [error]`,
                    }),
                    selections
                  );
                }
              },
              onStart: options.onSubscription
                ? () => {
                    options.onSubscription?.({
                      type: 'start',
                      unsubscribe,
                    });
                  }
                : undefined,
              onComplete: options.onSubscription
                ? () => {
                    options.onSubscription?.({
                      type: 'complete',
                      unsubscribe,
                    });
                  }
                : undefined,
            },
      });

      if (subResult instanceof Promise) {
        let loggingPromise: DeferredPromise<FetchEventData> | undefined;
        if (eventHandler.hasFetchSubscribers) {
          loggingPromise = createDeferredPromise();
          eventHandler.sendFetchPromise(loggingPromise.promise, selections);
        }
        const { unsubscribe, operationId } = await subResult;

        unsubscribeCallbacks.add(unsubscribe);

        loggingPromise?.resolve({
          cacheSnapshot: cache.cache,
          query,
          variables,
          selections,
          type: 'subscription',
          label: `[id=${operationId}] [created]`,
        });
      } else {
        unsubscribeCallbacks.add(subResult.unsubscribe);
      }
    }
  }

  async function resolveSelections<
    TQuery = unknown,
    TMutation = unknown,
    TSubscription = unknown
  >(
    selections: Selection[] | Set<Selection>,
    cache: CacheInstance = innerState.clientCache,
    options: FetchResolveOptions = {}
  ) {
    const selectionBranches = separateSelectionTypes(selections);

    try {
      await Promise.all(
        selectionBranches.map((selections) => {
          const [
            {
              noIndexSelections: [{ type }],
            },
          ] = selections;

          if (type === SelectionType.Query) {
            return buildAndFetchSelections<TQuery>(
              selections,
              'query',
              cache,
              options
            );
          } else if (type === SelectionType.Mutation) {
            return buildAndFetchSelections<TMutation>(
              selections,
              'mutation',
              cache,
              options
            );
          } else if (type === SelectionType.Subscription) {
            return buildAndSubscribeSelections<TSubscription>(
              selections,
              cache,
              options
            );
          } else {
            throw new TypeError('Invalid selection type');
          }
        })
      );
    } catch (err) {
      throw GQtyError.create(err);
    }
  }

  return {
    resolveSelections,
    buildAndFetchSelections,
    resolved,
    inlineResolved,
  };
}
