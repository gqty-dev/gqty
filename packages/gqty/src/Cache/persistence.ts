import { fromJSON, toJSON } from 'flatted';
import type { Cache, CacheLeaf, CacheNode, CacheObject, CacheRoot } from '.';
import { GQtyError } from '../Error';
import { deepCopy } from '../Helpers/deepCopy';
import { FrailMap } from '../Helpers/FrailMap';
import { isPlainObject } from '../Utils';
import { crawl } from './crawl';
import {
  CacheNormalizationHandler,
  isNormalizedObjectShell,
  NormalizedObjectShell,
  normalizeObject,
} from './normalization';

export type Persistors = {
  persist(version?: string): CacheSnapshot;
  restore(snapshot: CacheSnapshot, version?: string): boolean;
  restoreAsync(
    snapshot: () => Promise<CacheSnapshot>,
    version?: string
  ): Promise<boolean>;
};

/** Exported cache shape, for cache initialization and persistence. */
export type CacheSnapshot = {
  query?: Record<string, CacheSnapshotNode>;
  mutation?: Record<string, CacheSnapshotNode>;
  subscription?: Record<string, CacheSnapshotNode>;
  normalized?: Record<string, CacheSnapshotObject>;
  version?: string;
};

export type CacheSnapshotOutput = {
  query?: Record<string, CacheNode>;
  mutation?: Record<string, CacheNode>;
  subscription?: Record<string, CacheNode>;
  normalizedObjects?: FrailMap<string, NormalizedObjectShell<CacheObject>>;
};

export type CacheSnapshotObject = {
  __typename: string;
  [key: string]: CacheSnapshotNode | CacheLeaf;
};

export type CacheReference = { __ref: string };

export type CacheSnapshotNode =
  | CacheLeaf
  | CacheObject
  | CacheReference
  | CacheSnapshotNode[]
  | CacheSnapshotObject;

export const isCacheSnapshotObject = (
  value: unknown
): value is CacheSnapshotObject =>
  isPlainObject(value) && typeof value.__typename === 'string';

export const isCacheReference = (value: unknown): value is CacheReference =>
  isPlainObject(value) && typeof value.__ref === 'string';

export const importCacheSnapshot = (
  snapshot: CacheSnapshot,
  options?: CacheNormalizationHandler
): CacheSnapshotOutput => {
  const { query, mutation, subscription, normalized = {} } = deepCopy(snapshot);
  const seen = new Set();
  const data: CacheSnapshotOutput = crawl(
    { query, mutation, subscription },
    (it, key, parent) => {
      // Dereference
      if (isCacheReference(it)) {
        const norbj = normalized[it.__ref];
        (parent as any)[key] = norbj;

        if (!seen.has(norbj)) {
          seen.add(norbj);
          return [norbj, 0, []];
        }
      }

      return;
    }
  );

  if (Object.keys(data).length === 0) {
    throw new GQtyError(
      `No known root keys (query, mutation and subscription) are found.`
    );
  }

  if (options) {
    data.normalizedObjects = Object.entries(normalized).reduce(
      (store, [key, value]) => {
        const norbject = normalizeObject(value as CacheObject, {
          ...options,
          store,
        });

        if (norbject !== undefined) {
          store.set(key, norbject);
        }

        return store;
      },
      new FrailMap<string, NormalizedObjectShell<CacheObject>>()
    );
  }

  return data;
};

/**
 * Cache may contain circular reference of objects. To properly serialize it,
 * use `flatted` or `@ungap/structured-clone`.
 */
export const exportCacheSnapshot = (
  { query, mutation, subscription }: CacheRoot,
  options?: CacheNormalizationHandler
): CacheSnapshot => {
  const snapshot: CacheSnapshot = fromJSON(
    toJSON({ query, mutation, subscription })
  );

  if (options) {
    const normalized: Record<string, CacheSnapshotObject> = {};

    crawl(snapshot, (it, key, parent) => {
      const id = options?.identity(it);
      if (!id) return;

      if (!normalized[id]) {
        normalized[id] = isNormalizedObjectShell(it) ? it.toJSON() : it;
      }

      (parent as any)[key] = { __ref: id };
    });

    if (Object.keys(normalized).length > 0) {
      snapshot.normalized = normalized;
    }
  }

  return snapshot;
};

export const createPersistors = (cache: Cache): Persistors => ({
  persist(version) {
    const snapshot = cache.toJSON();
    if (version !== undefined) {
      snapshot.version = version;
    }

    return snapshot;
  },

  restore(data: CacheSnapshot, version?: string) {
    if (
      data.version !== version ||
      (version !== undefined && typeof version !== 'string')
    ) {
      console.warn(`[GQty] Cache version mismatch, ignored.`);
      return false;
    }

    if (data == null || typeof data !== 'object' || Array.isArray(data)) {
      return false;
    }

    try {
      cache.restore(data);
    } catch (e) {
      console.warn(e);
    } finally {
      return true;
    }
  },

  async restoreAsync(data, version) {
    try {
      return this.restore(await data(), version);
    } catch {
      return false;
    }
  },
});
