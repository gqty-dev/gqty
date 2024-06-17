import type { CacheNode, CacheObject } from '.';
import { GQtyError } from '../Error';
import { deepAssign } from '../Utils';
import { isCacheObject } from './utils';

const refKey = Symbol('__ref');

export type NormalizedObjectShell<TData extends CacheObject = CacheObject> =
  TData & {
    $set(value: TData): void;
    toJSON(): TData;
  };

export const isNormalizedObjectShell = (
  value: unknown
): value is NormalizedObjectShell => shells.has(value as never);

const deshell = (input: unknown) =>
  isNormalizedObjectShell(input) ? input.toJSON() : input;

const shells = new Set<NormalizedObjectShell>();

export type NormalizatioOptions<TData extends CacheObject = CacheObject> =
  CacheNormalizationHandler & {
    store: Map<string, NormalizedObjectShell<TData>>;
  };

/**
 * Update the store with incoming data, merge or replace them depends on
 * provided handlers.
 */
export const normalizeObject = <TData extends CacheObject>(
  data: TData,
  { identity, onConflict = (_, t) => t, store }: NormalizatioOptions<TData>
): NormalizedObjectShell<TData> | undefined => {
  if (typeof data !== 'object' || Array.isArray(data)) {
    throw new GQtyError(
      `Only objects can be normalized, received ${typeof data}.`
    );
  }

  const id = identity(data);
  if (!id) return;

  const existing = store.get(id);
  data = deshell(data) as TData;

  if (existing) {
    data = deepAssign({}, [existing.toJSON(), data], onConflict);

    existing.$set(data as TData);

    return existing;
  } else {
    const result = new Proxy(
      { [refKey]: data },
      {
        ownKeys(target) {
          return Reflect.ownKeys(target[refKey]);
        },
        getOwnPropertyDescriptor(target, key) {
          return Reflect.getOwnPropertyDescriptor(target[refKey], key);
        },
        set(target, key, value) {
          return Reflect.set(target[refKey], key, value);
        },
        get(target, key) {
          if (key === '$set') {
            return (value: TData) => {
              target[refKey] = value;
            };
          }

          if (key === 'toJSON') {
            return () => target[refKey];
          }

          return Reflect.get(target, key) ?? Reflect.get(target[refKey], key);
        },
      }
    ) as unknown as NormalizedObjectShell<TData>;

    shells.add(result);

    store.set(id, result);

    return result;
  }
};

/**
 * Recursively replace normalize input objects with the provided store.
 */
export const deepNormalizeObject = <TData extends CacheNode>(
  data: TData,
  options: NormalizatioOptions
): TData => {
  return walk(data);

  function walk<T = unknown>(input: T, depth = 0): T {
    if (depth < 15 && input && typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        (input as Record<string, unknown>)[key] = walk(value, depth + 1);
      }

      if (!Array.isArray(input) && isCacheObject(input)) {
        const id = options.identity(input);
        if (id) {
          const norbj = normalizeObject(input, options);
          if (norbj) {
            return norbj as T;
          }
        }
      }
    }

    return input;
  }
};

export type CacheNormalizationHandler = {
  /**
   * To disable normalization for a particular object, return undefined.
   */
  identity(value: CacheNode): string | undefined;

  onConflict?(
    /** Existing value */
    sourceValue: object,
    /** Incoming value */
    targetValue: object
  ): object | undefined;

  schemaKeys?: Record<string, string[]>;
};

export const defaultNormalizationHandler: CacheNormalizationHandler =
  Object.freeze({
    identity(value) {
      if (!value || typeof value !== 'object' || Array.isArray(value)) return;

      const identityFields = [value.__typename, value.id ?? value._id];

      if (identityFields.some((field) => field === undefined)) return;

      return identityFields.join(':');
    },
    onConflict(existing, incoming) {
      const mergeObjects = (a: CacheObject, b: CacheObject) => {
        const result = { ...a, ...b };

        if (isNormalizedObjectShell(a)) {
          a.$set(result);
          return a;
        } else if (isNormalizedObjectShell(b)) {
          b.$set(result);
          return b;
        }

        return result;
      };

      if (Array.isArray(existing) && Array.isArray(incoming)) {
        if (existing.length === incoming.length) {
          return;
          // for (const [k, a] of existing.entries()) {
          //   const b = incoming[k];
          //   if (isCacheObject(a) && isCacheObject(b)) {
          //     existing[k] = mergeObjects(a, b);
          //   }
          // }
        } else {
          // Replace the values, but keep the original array reference.
          existing.splice(0, existing.length, ...incoming);
        }
        return existing;
      } else if (isCacheObject(existing) && isCacheObject(incoming)) {
        return mergeObjects(existing, incoming);
      }
      //  else if (isCacheObject(existing) && isCacheObject(incoming)) {
      //   /**
      //    * Object subsets further closer to leaf nodes will replace objects closer
      //    * to root, we should blindly merge them in the same fetch.
      //    *
      //    * Replacements via isSubsetOf() may happen between fetches, not within.
      //    */
      //   if (isSubsetOf(existing, incoming) || isSubsetOf(incoming, existing)) {
      //     return { ...incoming, ...existing };
      //   } else {
      //     return incoming;
      //   }
      // }

      return;
    },
  });

export const isSubsetOf = (a: CacheObject, b: CacheObject) => {
  for (const [key, value] of Object.entries(a)) {
    if (value !== b[key]) {
      return false;
    }
  }

  return true;
};
