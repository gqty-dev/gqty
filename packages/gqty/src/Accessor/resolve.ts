import type { CacheObject } from '../Cache';
import { flattenObject } from '../Cache/crawl';
import { isCacheObject } from '../Cache/utils';
import { GQtyError } from '../Error';
import {
  GeneratedSchemaObject,
  parseSchemaType,
  SchemaUnionsKey,
  Type,
} from '../Schema';
import type { Selection } from '../Selection';
import type { Meta } from './meta';
import { $meta, $setMeta } from './meta';
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

  if (verbose && cacheKeys.length >= context.depthLimit) {
    throw new GQtyError(
      `Depth limit reached at ${cacheKeys.join(
        '.'
      )}, ignoring futther selections.`
    );
  }

  const cache =
    selection.parent === selection.root
      ? // The way we structure the cache for SWR requires special treatment
        // for 2nd level selections, e.g. query.hello, mutation.update()... etc.
        context.cache.get(cacheKeys.join('.'), context.cacheOptions) ?? {
          data: undefined,
          expiresAt: Infinity,
        }
      : { ...meta.cache };

  if (cache.data === undefined) {
    cache.expiresAt = Infinity;
  }

  let data = cache.data;

  const { pureType, isArray, isNullable } = parseSchemaType(__type);
  const type = context.schema[pureType];

  // Interfaces & unions pass through the data to children.
  if (
    !isUnion &&
    selection.root !== selection &&
    selection.root !== selection.parent &&
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

  // nullable types
  if (data === null) {
    if (!isNullable) {
      throw new GQtyError(`Cached null for non-nullable type ${pureType}.`);
    }

    return null;
  }

  if (!type) {
    // Scalar and scalar arrays
    if (context.scalars[pureType]) {
      context.onSelect?.(selection, { ...cache, data });

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

    // Getting an array of an object, not interacting with array items.
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

  return isArray && !isNumericSelection
    ? createArrayAccessor({
        cache,
        context,
        selection,
        type: { __type: pureType },
      })
    : createObjectAccessor({
        cache,
        context,
        selection,
        type: { __type },
      });
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
 * Globally defining the proxy handler to avoid accidential scope references.
 */
const objectProxyHandler: ProxyHandler<GeneratedSchemaObject> = {
  get(currentType: Record<string, Type | undefined>, key, proxy) {
    if (typeof key !== 'string') return;

    if (key === 'toJSON') {
      return () => {
        const data = $meta(proxy)?.cache.data;

        if (typeof data !== 'object' || data === null) {
          return data;
        }

        return Object.entries(data).reduce<Record<string, any>>(
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

    const { context, cache, selection } = meta;

    // Extract proxy data, keep the object reference unless users deep clone it.
    value = deepMetadata(value) ?? value;

    if (selection.cacheKeys.length <= 2) {
      const [type, field] = selection.cacheKeys;

      if (field) {
        context.cache.set({ [type]: { [field]: { [key]: value } } });
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
        currentSelection = currentSelection.getChild(key);
      }

      context.onSelect?.(currentSelection, { ...cache, data: scalar });
    }

    return result;
  },
};

export type AccessorOptions = {
  type: Record<string, Type | undefined>;
};

export const createObjectAccessor = <TSchemaType extends GeneratedSchemaObject>(
  meta: Meta
) => {
  const {
    cache: { data },
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

    const proxy = new Proxy(
      // `type` here for ownKeys proxy trap
      type as TSchemaType,
      data
        ? Object.assign({}, objectProxyHandler, {
            getOwnPropertyDescriptor: (target, key) =>
              Reflect.getOwnPropertyDescriptor(data, key) ??
              Reflect.getOwnPropertyDescriptor(target, key),
          } satisfies typeof objectProxyHandler)
        : objectProxyHandler
    );

    $setMeta(proxy, meta);

    return proxy;
  };

  return createAccessor();
};

/** Recursively replace proxy accessors with its actual cached value. */
export const deepMetadata = (input: any) => {
  const data = metadata(input);
  const stack = new Set([data]);
  const seen = new Set();

  for (const it of stack) {
    if (seen.has(it)) continue;
    seen.add(it);

    if (Array.isArray(it)) {
      for (let [k, v] of it.entries()) {
        if (isObject(v)) v = it[k] = metadata(v);

        stack.add(v);
      }
    } else if (isObject(it)) {
      for (let [k, v] of Object.entries(it)) {
        if (isObject(v)) v = it[k] = metadata(v);

        stack.add(v);
      }
    }
  }

  return data;

  function metadata<TData extends Record<string, unknown>>(it: TData): TData {
    return ($meta(it)?.cache.data as TData) ?? it;
  }

  function isObject(it: any): it is Record<string, any> {
    return typeof it === 'object' && it !== null;
  }
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
    if (typeof key === 'symbol' || +key !== +key) {
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

export const createArrayAccessor = <
  TSchemaType extends GeneratedSchemaObject[]
>(
  meta: Meta
) => {
  if (!Array.isArray(meta.cache.data)) {
    throw new GQtyError(`Cache data must be an array.`);
  }

  const proxy = new Proxy(meta.cache.data as TSchemaType, arrayProxyHandler);

  $setMeta(proxy, meta);

  return proxy;
};
