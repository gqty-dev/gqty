import type { CacheDataContainer, CacheNode, CacheObject } from '../Cache';
import { flattenObject } from '../Cache/crawl';
import { isCacheObject } from '../Cache/utils';
import { GQtyError } from '../Error';
import {
  SchemaUnionsKey,
  parseSchemaType,
  type GeneratedSchemaObject,
  type Type,
} from '../Schema';
import type { Selection } from '../Selection';
import { isPlainObject } from '../Utils';
import type { Meta } from './meta';
import { $meta } from './meta';
import { createSkeleton, isSkeleton } from './skeleton';

const verbose = process.env.NODE_ENV !== 'production';

/**
 * Check provided accessor with the new selection, returns appropriate
 * accessors, data skeleton or cached value according to the generated schema.
 */
export const resolve = (
  accessor: GeneratedSchemaObject,
  /** Incoming new selection to check against the accessor. */
  selection: Selection,
  __type: Type['__type']
) => {
  const meta = $meta(accessor);
  if (!meta) return;

  const { context } = meta;
  const { alias, key, isUnion, cacheKeys } = selection;
  const isNumericSelection = +key === +key;

  if (cacheKeys.length >= context.depthLimit) {
    if (verbose) {
      throw new GQtyError(
        `Depth limit reached at ${cacheKeys.join(
          '.'
        )}, ignoring further selections.`
      );
    }

    return;
  }

  const cache: CacheDataContainer<CacheNode> =
    selection.parent === selection.root && key !== '__typename'
      ? // The way we structure the cache for SWR requires special treatment
        // for 2nd level selections, e.g. query.hello, mutation.update()... etc.
        ensureCache(cacheKeys[0], cacheKeys[1], meta)
      : Object.defineProperties(
          { data: undefined, expiresAt: Infinity },
          Object.getOwnPropertyDescriptors(meta.cache)
        );

  let data = cache.data;

  const { pureType, isArray, isNullable } = parseSchemaType(__type);
  const type = context.schema[pureType];

  // Interfaces & unions pass through the data to children.
  if (
    !isUnion &&
    selection.root !== selection &&
    (selection.root !== selection.parent || key === '__typename') &&
    data !== null
  ) {
    if (Array.isArray(data)) {
      if (verbose && !isNumericSelection) {
        console.warn(`[GQty] Accessing arrays with non-numeric key "${key}".`);
      }

      data = data[+key];
    } else if (typeof data === 'object') {
      data = data[alias ?? key];
    }
  }

  // Proxy cannot wrap nulls, short-circuit here to avoid unnecessary checks.
  if (data === null) {
    if (!isNullable) {
      throw new GQtyError(`Cached null for non-nullable type ${pureType}.`);
    }

    if (context.scalars[pureType]) {
      context.select(selection, cache);
    }
    // Trigger cached sub-selections for nullable object types.
    else {
      context.select(selection);
    }

    return null;
  }

  if (!type) {
    // Scalar and scalar arrays
    if (context.scalars[pureType]) {
      // Force expired caches, this happens when users keep intermediate
      // accessors before a cache update. When properties of these stale
      // accessors are accessed, they should read new data from the cache.
      if (cache.expiresAt === -Infinity) {
        data = context.cache.get(
          selection.cacheKeys.join('.'),
          context.cacheOptions
        )?.data;
      }

      context.select(selection, { ...cache, data });

      return isArray ? (Array.isArray(data) ? data : [undefined]) : data;
    }

    // Interfaces and unions ($on)
    const unions = context.schema[SchemaUnionsKey]?.[pureType.slice(1)];
    if (unions?.length) {
      return createUnionAccessor({
        context,
        cache: meta.cache,
        possibleTypes: unions,
        selection,
      });
    }

    throw new GQtyError(`GraphQL type not found: ${pureType}`);
  }

  // Data skeleton
  if (data === undefined) {
    data = createSkeleton(() => ({}));

    // User is currently getting the array itself, not array items. We wrap the
    // skeleton object with a makeshift array.
    if (isArray && !isNumericSelection) {
      data = createSkeleton(() => [data]);
    }

    // When accesing cache roots, put skeletons back in for optimistic updates.
    if (cacheKeys.length === 2) {
      const [type, field] = cacheKeys;
      context.cache.set({ [type]: { [field]: data } });
    }
  }

  // Update the cache with skeleton or moulded data
  if (
    cacheKeys.length > 2 &&
    cache.data &&
    typeof cache.data === 'object' &&
    !Array.isArray(cache.data) &&
    !isNumericSelection
  ) {
    cache.data[alias ?? key] = data;
  }

  cache.data = data;

  if (isArray && !isNumericSelection) {
    return createArrayAccessor({
      cache,
      context,
      selection,
      type: { __type: pureType },
    });
  } else {
    return createObjectAccessor({
      cache,
      context,
      selection,
      type: { __type },
    });
  }
};

export const createUnionAccessor = ({
  context,
  cache,
  possibleTypes,
  selection,
}: Omit<Meta, 'type'> & { possibleTypes: readonly string[] }) => {
  return new Proxy(
    Object.fromEntries(possibleTypes.map((__typename) => [__typename, true])),
    {
      get(_, __typename) {
        if (typeof __typename !== 'string') return;
        if (!possibleTypes.includes(__typename)) return;

        const data = cache.data;
        if (
          !isSkeleton(data) &&
          (!isCacheObject(data) || data.__typename !== __typename)
        )
          return;

        const type = context.schema[__typename];
        if (!type) return;

        return createObjectAccessor({
          context,
          cache,
          selection: selection.getChild(__typename, { isUnion: true }),
          type: { __type: __typename },
        });
      },
    }
  );
};

/**
 * Creates a proxy handler for object accessors.
 *
 * Key fix for React 19 dev mode: For data-backed proxies, `ownKeys()` only
 * returns keys that exist in the cache, not all schema fields. This prevents
 * React's prop diffing from triggering selections for fields the user never
 * requested. The `activeEnumerators` context flag overrides this behavior for
 * helpers like selectFields() that need to enumerate all schema fields.
 */
const createObjectProxyHandler = (
  data: CacheObject | undefined,
  context: { activeEnumerators: number }
): ProxyHandler<GeneratedSchemaObject> => {
  return {
    ownKeys(target) {
      // When activeEnumerators > 0 (e.g., selectFields helper), always
      // return all schema keys regardless of cache state.
      if (
        process.env.NODE_ENV === 'production' ||
        context.activeEnumerators > 0
      ) {
        return Reflect.ownKeys(target).filter(
          (k) => typeof k === 'string'
        ) as string[];
      }

      // For data-backed proxies with actual data, only return keys that exist
      // in the cache. This prevents React 19's prop diffing from seeing all
      // schema fields when it enumerates a proxy - it only sees the actually
      // cached fields.
      //
      // For skeleton proxies (no data or empty data), return all schema keys
      // so that spread and for...in work correctly for initial selections.
      const dataKeys = data
        ? (Reflect.ownKeys(data).filter(
            (k) => typeof k === 'string'
          ) as string[])
        : [];

      if (dataKeys.length > 0) {
        return dataKeys;
      }

      return Reflect.ownKeys(target).filter(
        (k) => typeof k === 'string'
      ) as string[];
    },
    getOwnPropertyDescriptor(target, key) {
      // For data-backed proxies, check data first
      if (data) {
        return (
          Reflect.getOwnPropertyDescriptor(data, key) ??
          Reflect.getOwnPropertyDescriptor(target, key)
        );
      }

      return Reflect.getOwnPropertyDescriptor(target, key);
    },
    get(currentType: Record<string, Type | undefined>, key, proxy) {
      if (typeof key !== 'string') return;

      if (key === 'toJSON') {
        return () => {
          const data = $meta(proxy)?.cache.data;

          if (typeof data !== 'object' || data === null) {
            return data;
          }

          return Object.entries(data).reduce<Record<string, unknown>>(
            (prev, [key, value]) => {
              if (!isSkeleton(value)) {
                prev[key] = value;
              }

              return prev;
            },
            {}
          );
        };
      }

      const meta = $meta(proxy);
      if (!meta) return;

      if (
        // Skip Query, Mutation and Subscription
        meta.selection.parent !== undefined &&
        // Prevent infinite recursions
        !getIdentityFields(meta).includes(key)
      ) {
        selectIdentityFields(proxy, currentType);
      }

      const targetType = currentType[key];
      if (!targetType || typeof targetType !== 'object') return;

      const { __args, __type } = targetType;
      if (__args) {
        return (args?: Record<string, unknown>) =>
          resolve(
            proxy,
            meta.selection.getChild(
              key,
              args ? { input: { types: __args!, values: args } } : {}
            ),
            __type
          );
      }

      return resolve(proxy, meta.selection.getChild(key), __type);
    },
    set(_, key, value, proxy) {
      const meta = $meta(proxy);
      if (typeof key !== 'string' || !meta) return false;

      const { cache, context, selection } = meta;

      // Extract proxy data, keep the object reference unless users deep clone it.
      value = deepMetadata(value) ?? value;

      if (selection.ancestry.length <= 2) {
        const [type, field] = selection.cacheKeys;

        if (field) {
          const data =
            context.cache.get(`${type}.${field}`, context.cacheOptions)?.data ??
            {};

          if (!isPlainObject(data)) return false;

          data[key] = value;

          context.cache.set({ [type]: { [field]: data } });
        } else {
          context.cache.set({ [type]: { [key]: value } });
        }
      }

      let result = false;

      if (isCacheObject(cache.data)) {
        result = Reflect.set(cache.data, key, value);
      }

      /**
       * Ported for backward compatability.
       *
       * Triggering selections via optimistic updates is asking for infinite
       * recursions, also it's unnecessarily complicated to infer arrays,
       * interfaces and union selections down the selection tree.
       *
       * If we can't figure out an elegant way to infer selections in future
       * iterations, remove it at some point.
       */
      for (const [keys, scalar] of flattenObject(value)) {
        let currentSelection = selection.getChild(key);
        for (const key of keys) {
          // Skip array indices
          if (!isNaN(Number(key))) continue;

          currentSelection = currentSelection.getChild(key);
        }

        context.select(currentSelection, { ...cache, data: scalar });
      }

      return result;
    },
  };
};

export type AccessorOptions = {
  type: Record<string, Type | undefined>;
};

export const createObjectAccessor = <TSchemaType extends GeneratedSchemaObject>(
  meta: Meta
) => {
  const {
    cache: { data },
    context,
    context: { schema },
    type: { __type },
  } = meta;
  if (data !== undefined && !isCacheObject(data)) {
    throw new GQtyError(
      `Invalid type ${
        data === null ? 'null' : typeof data
      } for object accessors.`
    );
  }

  const createAccessor = () => {
    const type = schema[parseSchemaType(__type).pureType];
    if (!type) throw new GQtyError(`Invalid schema type ${__type}.`);

    // Create a per-proxy handler
    // Pass context for activeEnumerators flag access
    const handler = createObjectProxyHandler(
      isCacheObject(data) ? data : undefined,
      context
    );

    const proxy = new Proxy(
      // `type` here for ownKeys proxy trap
      type as TSchemaType,
      handler
    );

    $meta.set(proxy, meta);

    return proxy;
  };

  return createAccessor();
};

/** Recursively replace proxy accessors with its actual cached value. */
export const deepMetadata = (input: Record<string, unknown>) => {
  const data = metadata(input);
  const stack = new Set<unknown>([data]);
  const seen = new Set<unknown>();

  for (const it of stack) {
    if (seen.has(it)) continue;
    seen.add(it);

    if (Array.isArray(it)) {
      for (const [k, v] of it.entries()) {
        if (isObject(v)) {
          stack.add((it[k] = metadata(v)));
        } else {
          stack.add(v);
        }
      }
    } else if (isObject(it)) {
      for (const [k, v] of Object.entries(it)) {
        if (isObject(v)) {
          stack.add((it[k] = metadata(v)));
        } else {
          stack.add(v);
        }
      }
    }
  }

  return data;

  function metadata<TData extends Record<string, unknown>>(it: TData): TData {
    return ($meta(it)?.cache.data as TData) ?? it;
  }

  function isObject(it: unknown): it is Record<string, unknown> {
    return typeof it === 'object' && it !== null;
  }
};

/**
 * Read data from cache, creates an empty data slot that never expires when
 * target is not found.
 *
 * `expiresAt` and `swrBefore` is read from cache real-time, allowing stale
 * accessor references to keep working.
 */
const ensureCache = (
  type: string,
  field: string,
  { context: { cache, cacheOptions } }: Meta
) => {
  if (!cache.get(`${type}.${field}`, cacheOptions)) {
    cache.set({ [type]: { [field]: undefined } });
  }

  const { data } = cache.get(`${type}.${field}`, cacheOptions)!;

  return {
    data,
    get expiresAt() {
      return (
        cache.get(`${type}.${field}`, cacheOptions)?.expiresAt ?? -Infinity
      );
    },
    get swrBefore() {
      return (
        cache.get(`${type}.${field}`, cacheOptions)?.swrBefore ?? -Infinity
      );
    },
  };
};

/**
 * Look up user specified key fields for the type. Defaults to `id`, and `_id`
 * if `id` is not found.
 */
const getIdentityFields = ({
  context: { typeKeys },
  type: { __type },
}: Meta) => {
  const { pureType } = parseSchemaType(__type);

  return typeKeys?.[pureType] ?? ['__typename', 'id', '_id'];
};

/** Add identity fields into selection. */
const selectIdentityFields = (
  accessor: CacheObject,
  type: Record<string, Type | undefined>
) => {
  if (accessor == null) return;

  const meta = $meta(accessor);
  if (!meta) return;

  const {
    selection: { parent, isUnion },
  } = meta;

  // Always __typename except inside interfaces and unions
  if (parent?.key !== '$on') {
    accessor.__typename;
  }

  const keys = getIdentityFields(meta);
  for (const key of keys) {
    // Field not exist on this object type
    if (!type[key]) continue;

    // Already selected at the common root of this interface/union.
    if (isUnion && parent?.parent?.children.has(key)) continue;

    accessor[key];
  }
};

/**
 * A proxy handler globally defined to avoid accidential scope references.
 */
const arrayProxyHandler: ProxyHandler<CacheObject[]> = {
  get(_, key, proxy) {
    const meta = $meta(proxy);
    if (!meta) return;

    if (key === 'toJSON' && !isSkeleton(meta.cache.data)) {
      return () => $meta(proxy)?.cache.data;
    }

    const {
      cache: { data },
      selection,
    } = meta;
    if (!Array.isArray(data)) return;

    if (typeof key === 'string') {
      if (!Array.isArray(data)) {
        throw new GQtyError(`Cache data must be an array.`);
      }

      if (key === 'length') proxy[0];

      const numKey = +key;
      if (!isNaN(numKey) && numKey < data.length) {
        return resolve(proxy, selection.getChild(numKey), meta.type.__type);
      }
    }

    const value = Reflect.get(data, key);
    if (typeof value === 'function') {
      return value.bind(proxy);
    }

    return value;
  },
  set(_, key, value, proxy) {
    if (typeof key === 'symbol' || (key !== 'length' && +key !== +key)) {
      throw new GQtyError(`Invalid array assignment.`);
    }

    const meta = $meta(proxy);
    if (!meta) return false;

    const {
      cache: { data },
    } = meta;
    if (!Array.isArray(data)) return false;

    value = $meta(value)?.cache.data ?? value;

    return Reflect.set(data, key, value);
  },
};

export const createArrayAccessor = (meta: Meta) => {
  const { cache, context, selection } = meta;

  if (!Array.isArray(cache.data)) {
    if (verbose) {
      console.warn(
        'Invalid cache for an array accessor, monkey-patch by wrapping it with an array.',
        meta,
        meta.context.cache.toJSON()
      );
    }

    cache.data = [cache.data];
  }

  // Trigger cached sub-selections for empty arrays.
  if (cache.data.length === 0) {
    context.select(selection);
  }

  const proxy = new Proxy(cache.data, arrayProxyHandler);

  $meta.set(proxy, meta);

  return proxy;
};
