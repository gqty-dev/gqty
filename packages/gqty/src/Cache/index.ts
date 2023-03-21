import set from 'just-safe-set';
import { MultiDict } from 'multidict';
import { isSkeleton } from '../Accessor/skeleton';
import { deepCopy, FrailMap, select } from '../Helpers';
import type { GeneratedSchemaObject } from '../Schema';
import type { Selection } from '../Selection';
import { crawl } from './crawl';
import {
  CacheNormalizationHandler,
  deepNormalizeObject,
  defaultNormalizationHandler,
  NormalizedObjectShell,
} from './normalization';
import {
  CacheSnapshot,
  exportCacheSnapshot,
  importCacheSnapshot,
} from './persistence';
import { isCacheObject } from './utils';

export type CacheRoot = {
  query?: CacheObject;
  mutation?: CacheObject;
  subscription?: CacheObject;
};

export type CacheNode = CacheLeaf | CacheNode[] | CacheObject;

export type CacheObject = {
  __typename?: string;
  [key: string]: CacheNode | CacheLeaf;
};

export type CacheLeaf = string | number | boolean | null | undefined;

export type CacheOptions = {
  readonly maxAge?: number;

  /**
   * `false` to disable normalized cache, which usually means manual
   * refetching after mutations.
   */
  readonly normalization?: boolean | CacheNormalizationHandler;

  readonly staleWhileRevalidate?: number;
};

export type CacheDataContainer<TData extends CacheNode = CacheNode> = {
  data: TData;

  /**
   * data is open to TTL eviction after this time, before that only LRU eviction
   * may take place.
   */
  expiresAt: number;

  /**
   * A hint for clients to revaliate, does not affect automatic cache eviction.
   */
  swrBefore?: number;

  /**
   * Internal reference of cache eviction timeout, subject to change in the
   * future.
   */
  timeout?: ReturnType<typeof setTimeout>;
};

export type CacheListener = <TData extends CacheNode = CacheNode>(
  value: TData
) => void;

export type CacheGetOptions = {
  includeExpired?: boolean;
};

export type CacheSetOptions = {
  skipNotify?: boolean;
};

/**
 * A scoped cache for accessors, selections and data with expiry awareness.
 */
// TODO: LRU cap size
// TODO: Normalized cache eviction: evict(id: string) {}
// TODO: Simple cache eviction: evict(type: string, field: string) {}
export class Cache {
  #maxAge = Infinity;
  get maxAge() {
    return this.#maxAge;
  }

  #staleWhileRevalidate: number = 0;
  get staleWhileRevalidate() {
    return this.#staleWhileRevalidate;
  }

  #normalizationOptions?: CacheNormalizationHandler;
  get normalizationOptions() {
    return this.#normalizationOptions;
  }

  /**
   * The actual data cache. Cache keys are formatted as the first 2 layer of
   * the selection path, e.g. `['query', 'user']` for `query.user`.
   *
   * This enables a cache expiry/eviction strategy based on top-level queries.
   */
  #data = new FrailMap<string, CacheDataContainer>();

  /** Look up table for normalized objects. */
  #normalizedObjects = new Map<string, NormalizedObjectShell<CacheObject>>();

  constructor(
    data?: CacheSnapshot,
    {
      maxAge = Infinity,
      staleWhileRevalidate = 5 * 30 * 1000,
      normalization,
    }: CacheOptions = {}
  ) {
    this.#maxAge = Math.max(maxAge, 0);
    this.#staleWhileRevalidate = Math.max(staleWhileRevalidate, 0);

    if (normalization) {
      this.#normalizationOptions =
        normalization === true
          ? defaultNormalizationHandler
          : Object.freeze({ ...normalization });
    }

    if (data) {
      this.restore(data);
    }
  }

  restore(data: CacheSnapshot) {
    const { query, mutation, subscription, normalizedObjects } =
      importCacheSnapshot(data, this.normalizationOptions) ?? {};

    this.#normalizedObjects = normalizedObjects ?? new FrailMap();
    this.#data = new FrailMap();

    this.set({ query, mutation, subscription }, { skipNotify: true });
  }

  /** Subscription paths and it's listener function. */
  #subscriptions = new Map<readonly string[], CacheListener>();

  /** Subscription paths that reached a normalized object. */
  #normalizedSubscriptions = new MultiDict<CacheObject, CacheListener>();

  /** Subscribe to cache changes. */
  subscribe(paths: string[], fn: CacheListener) {
    const pathsSnapshot = Object.freeze([...paths]);

    this.#subscriptions.set(pathsSnapshot, fn);
    this.#subscribeNormalized(paths, fn);

    return () => {
      this.#subscriptions.delete(pathsSnapshot);
      this.#normalizedSubscriptions.delete(fn);
    };
  }

  #subscribeNormalized(paths: readonly string[], fn: CacheListener) {
    const getId = this.normalizationOptions?.identity;
    if (!getId) return;

    const store = this.#normalizedObjects;
    const nsubs = this.#normalizedSubscriptions;

    nsubs.delete(fn);

    for (const path of paths) {
      const [type, field, ...parts] = path.split('.');
      select(this.get(`${type}.${field}`)?.data, parts, (node) => {
        const id = getId(node);
        if (id && store.has(id) && isCacheObject(node)) {
          nsubs.set(node, fn);
        }

        return node;
      });
    }
  }

  // FIXME
  // This is pretty inefficient, but maintaining an indexed tree is too much
  // effort right now. Accepting PRs.
  #notifySubscribers = (value: CacheRoot) => {
    // Collect all relevant listeners from both path selections and
    // normalized objects in a unique Set.
    const listeners = new Set<CacheListener>();
    const subs = this.#subscriptions;
    const nsubs = this.#normalizedSubscriptions;
    const getId = this.normalizationOptions?.identity;

    for (const [paths, notify] of this.#subscriptions) {
      for (const path of paths) {
        const parts = path.split('.');
        const node = select(value, parts, (node) => {
          // Normalized subscriptions
          if (getId?.(node) && isCacheObject(node)) {
            // If already subscribed, notify it.
            nsubs.get(node)?.forEach((notify) => {
              listeners.add(notify);
            });

            // Otherwise, subscribe it for future cross-triggering. Current
            // invocation can be skipped because normal path traversion goes
            // down to single properties and is more accurate.
            nsubs.set(node, notify);
          }

          return node;
        });

        // Notify and breaks when one of the path hits
        if (
          Array.isArray(node)
            ? (node as unknown[])
                .flat(Infinity)
                .some((item) => item !== undefined)
            : node !== undefined
        ) {
          listeners.add(notify);
          break;
        }
      }
    }

    // Re-calculate normalized subscriptions of relevant objects when we have
    // normalization enabled.
    if (getId) {
      // Normalized objects reachable by all subscribers, these subscribers
      // should also subscribe to these objects. Since we have no idea what had
      // been replaced by the current call to `cache.set()`, these subscription
      // paths has to re-subscribe from scratch to remove those no longer
      // relevant.
      const norbjs = new Set<CacheObject>();

      // Crawl value to find all normalized objects
      crawl(value, (node) => {
        if (getId(node) && isCacheObject(node)) {
          norbjs.add(node);
        }
      });

      const resubscribingListeners = new Set<CacheListener>();

      for (const norbj of norbjs) {
        for (const listener of nsubs.get(norbj) ?? []) {
          listeners.add(listener);
          resubscribingListeners.add(listener);
        }
      }

      // Resubscribe
      for (const listener of resubscribingListeners) {
        for (const [paths, _listener] of subs) {
          if (listener === _listener) {
            this.#subscribeNormalized(paths, listener);
          }
        }
      }
    }

    // Invoke all reachable listeners with a snapshot of value.
    if (listeners.size > 0) {
      const valueSnapshot = deepCopy(value);
      for (const notify of listeners) {
        notify(valueSnapshot);
      }
    }
  };

  /* FIXME
   *
   * Caching accessors by selections is a mean to retain sub-selections when
   * nullable arrays and objects has null cached, such accessors will return
   * null and no futher selections can be triggered on them.
   *
   * Only when cache value is null, such a cache should be responsible for
   * returning all child selections made last time in this scope.
   *
   * Caching accessors by cache values is broken with normalization enabled.
   * Different selection paths leading to the same normalized object overwrites
   * each other, along with the selection inside.
   *
   * Current workaround is to cache selection children in parents, preventing
   * excessive selection object creation.
   */
  #selectionAccessors = new WeakMap<Selection, GeneratedSchemaObject>();

  getAccessor<TSchemaType extends GeneratedSchemaObject>(
    selection: Selection,
    createAccessor: () => TSchemaType
  ): TSchemaType {
    const map = this.#selectionAccessors;
    const accessor = map.get(selection) ?? createAccessor();

    if (!map.has(selection)) {
      map.set(selection, accessor);
    }

    return accessor as TSchemaType;
  }

  /**
   * Retrieve cache values by first 2 path segments, e.g. `query.todos` or
   * `mutation.createTodo`.
   */
  get(
    path: string,
    { includeExpired }: CacheGetOptions = {}
  ): CacheDataContainer | undefined {
    const [, type, key, subpath] =
      path.match(/^([a-z]+(?:\w*))\.(?:__)?([a-z]+(?:\w*))(.*[^\.])?$/i) ?? [];
    if (!type || !key) {
      throw new ReferenceError(
        'Cache path must starts with `${type}.`: ' + path
      );
    }

    const cacheKey = `${type}.${key}`;

    let dataContainer = this.#data.get(cacheKey);
    if (dataContainer === undefined) {
      return;
    }

    const { expiresAt, swrBefore } = dataContainer;
    let { data } = dataContainer;

    return {
      data:
        expiresAt < Date.now() && !includeExpired
          ? undefined
          : subpath
          ? select(data, subpath.slice(1).split('.'))
          : data,
      expiresAt,
      swrBefore,
    };
  }

  /**
   * Merge objects into the current cache, recursively normalize incoming values
   * if normalization is enabled. Notifies cache listeners afterwards.
   *
   * Example value: `{ query: { foo: "bar" } }`
   */
  set(values: CacheRoot, { skipNotify = false }: CacheSetOptions = {}) {
    const age = this.maxAge;
    const swr = this.staleWhileRevalidate;
    const now = Date.now();

    // Normalize incoming data before merging.
    if (this.normalizationOptions) {
      values = deepNormalizeObject(values, {
        ...this.normalizationOptions,
        store: this.#normalizedObjects,
      });
    }

    for (const [type, cacheObjects = {}] of Object.entries(values)) {
      for (const [field, data] of Object.entries(cacheObjects as CacheObject)) {
        const cacheKey = `${type}.${field}`;

        clearTimeout(this.#data.get(cacheKey)?.timeout);

        const dataContainer: CacheDataContainer =
          // Mutation and subscription results should be returned right away for
          // immediate use. Their responses are only meaningful to a cache with
          // normalization enabled, where it updates subscribing clients.
          // We force a short expiration to let it survives the next render,
          // then leave it up for GC.
          type === 'mutation' || type === 'subscription'
            ? {
                data,
                expiresAt: now + 100,
                swrBefore: now,
              }
            : {
                data,
                expiresAt: age + now,
                swrBefore: age + swr + now,
              };

        if (isFinite(age + swr)) {
          const timeout = setTimeout(
            // Hold on to lexical scope reference, preventing GC from WeakRef.
            () => dataContainer,
            age + swr
          );

          if (typeof timeout === 'object') {
            timeout.unref();
          }

          dataContainer.timeout = timeout;
        }

        this.#data.set(cacheKey, dataContainer, { strong: !isFinite(age) });
      }
    }

    if (!skipNotify) {
      this.#notifySubscribers(values);
    }
  }

  toJSON() {
    const snapshot =
      // Remove skeletons
      crawl(
        [...this.#data].reduce((prev, [key, { data }]) => {
          set(prev, key, data);
          return prev;
        }, {} as CacheRoot),
        (it, key, obj) => {
          if (isSkeleton(it)) {
            delete (obj as any)[key];
          }
        }
      );

    if (this.normalizationOptions) {
      return exportCacheSnapshot(snapshot, this.normalizationOptions);
    } else {
      return snapshot;
    }
  }
}
