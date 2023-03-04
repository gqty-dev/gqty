// Cache/slim.ts: A slim version of the original data cache

import set from 'just-safe-set';
import { isSkeleton } from '../Accessor/skeleton';
import { deepCopy } from '../Helpers/deepCopy';
import { FrailMap } from '../Helpers/FrailMap';
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
  maxAge?: number;
  normalization?: boolean | CacheNormalizationHandler;
  staleWhileRevalidate?: number;
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

  #staleWhileRevalidate = 0;

  #data = new FrailMap<string, CacheDataContainer>();

  #normalizationHandler?: CacheNormalizationHandler;

  /** Look up table for normalized objects. */
  #normalizedObjects = new FrailMap<
    string,
    NormalizedObjectShell<CacheObject>
  >();

  constructor(
    data?: CacheSnapshot,
    {
      maxAge = Infinity,
      staleWhileRevalidate = 3600,
      normalization,
    }: CacheOptions = {}
  ) {
    this.#maxAge = maxAge;
    this.#staleWhileRevalidate = staleWhileRevalidate;

    if (normalization) {
      this.#normalizationHandler =
        normalization === true ? defaultNormalizationHandler : normalization;
    }

    if (data) {
      this.restore(data);
    }
  }

  restore(data: CacheSnapshot) {
    const { query, mutation, subscription, normalizedObjects } =
      importCacheSnapshot(data, this.#normalizationHandler) ?? {};

    this.#normalizedObjects = normalizedObjects ?? new FrailMap();
    this.#data = new FrailMap();

    this.set({ query, mutation, subscription }, { skipNotify: true });
  }

  #subscriptions = new Map<readonly string[], CacheListener>();

  /** Subscription paths that reached a normalized object. */
  #normalizedSubscriptions = new WeakMap<
    CacheObject,
    Map<readonly string[], CacheListener>
  >();

  /** Subscribe to cache changes. */
  subscribe(paths: string[], fn: CacheListener) {
    const pathsSnapshot = Object.freeze([...paths]);
    const unsubFns = new Set<() => void>();

    this.#subscriptions.set(pathsSnapshot, fn);
    unsubFns.add(() => this.#subscriptions.delete(pathsSnapshot));

    // Normalized
    {
      const store = this.#normalizedObjects;
      const subs = this.#normalizedSubscriptions;
      const getId = this.#normalizationHandler?.identity;
      if (getId) {
        const scanNorbjs = (node: CacheNode, path: string[] = []) => {
          for (const item of Array.isArray(node) ? node : [node]) {
            if (!isCacheObject(item)) break;

            const id = getId(item);
            if (id && store.has(id)) {
              const sub = (
                subs.get(item) ?? new Map<readonly string[], CacheListener>()
              ).set(pathsSnapshot, fn);

              subs.set(item, sub);

              unsubFns.add(() => {
                sub.delete(pathsSnapshot);
              });
            }

            if (path.length > 0) {
              scanNorbjs(item[path.shift()!], path);
            }
          }
        };

        for (const path of paths) {
          const [type, field, ...parts] = path.split('.');

          // Skip normalizations for out-of-spec paths to avoid pitfalls
          if (!type || !field) continue;

          scanNorbjs(this.get(`${type}.${field}`)?.data, parts);
        }
      }
    }

    return () => {
      unsubFns.forEach((unsub) => unsub());
    };
  }

  // This is pretty inefficient, but maintaining an indexed tree is too much
  // effort right now. Accepting PRs.
  #notifySubscribers = (value: CacheRoot) => {
    const ref = {
      memo: undefined as any,
      get current() {
        return this.memo ?? (this.memo = deepCopy(value));
      },
    };

    for (const [paths, notify] of this.#subscriptions) {
      for (const path of paths) {
        const parts = path.split('.');
        const node = select(value, parts);

        // Notify and breaks when something is hit
        if (
          Array.isArray(node)
            ? (node as unknown[])
                .flat(Infinity)
                .some((item) => item !== undefined)
            : node !== undefined
        ) {
          notify(ref.current);
          break;
        }
      }
    }

    // Normalized
    if (this.#normalizationHandler) {
      crawl(value, (node) => {
        if (isCacheObject(node)) {
          this.#normalizedSubscriptions
            .get(node)
            ?.forEach((notify) => notify(ref.current));
        }
      });
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
    const age = this.#maxAge;
    const swr = this.#staleWhileRevalidate;
    const now = Date.now();

    // Normalize incoming data before merging.
    if (this.#normalizationHandler) {
      values = deepNormalizeObject(values, {
        ...this.#normalizationHandler,
        store: this.#normalizedObjects,
      });
    }

    for (const [type, cacheObjects = {}] of Object.entries(values)) {
      for (const [field, data] of Object.entries(cacheObjects as CacheObject)) {
        const cacheKey = `${type}.${field}`;

        clearTimeout(this.#data.get(cacheKey)?.timeout);

        const dataContainer: CacheDataContainer = {
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

    if (this.#normalizationHandler) {
      return exportCacheSnapshot(snapshot, this.#normalizationHandler);
    } else {
      return snapshot;
    }
  }
}

/**
 * Similar to _.get() but dots goes into arrays.
 *
 * JSONata, JSONPath and JMESPath does similar things but they're overkill here.
 */
export function select(node: CacheNode, path: string[]): CacheNode {
  if (node == null || typeof node !== 'object' || path.length === 0) {
    return node;
  }

  if (Array.isArray(node)) {
    return node.map((item) => select(item, path));
  }

  const [key, ...rest] = path;

  return select(node[key], rest);
}
