import { $meta } from '../Accessor';
import { isObject, isPlainObject } from '../Utils';

export function getFields<
  TAccesorData extends object | undefined | null,
  TAccesorKeys extends keyof NonNullable<TAccesorData>,
>(accessor: TAccesorData, ...keys: TAccesorKeys[]): TAccesorData {
  if (!isObject(accessor)) return accessor;

  // Allow enumeration to see all schema fields, not just cached ones.
  // Only needed in dev mode where we restrict ownKeys to prevent React 19's
  // prop diffing from triggering selections.
  const meta =
    process.env.NODE_ENV !== 'production' ? $meta(accessor) : undefined;
  if (meta) {
    meta.context.activeEnumerators++;
  }

  try {
    if (keys.length) for (const key of keys) Reflect.get(accessor, key);
    else for (const key in accessor) Reflect.get(accessor, key);
  } finally {
    if (meta) {
      meta.context.activeEnumerators--;
    }
  }

  return accessor;
}

export function getArrayFields<
  TArrayValue extends object | null | undefined,
  TArray extends TArrayValue[] | null | undefined,
  TArrayValueKeys extends keyof NonNullable<NonNullable<TArray>[number]>,
>(accessorArray: TArray, ...keys: TArrayValueKeys[]): TArray {
  if (accessorArray == null) return accessorArray;

  if (Array.isArray(accessorArray)) {
    for (const value of accessorArray) {
      if (isPlainObject(value)) {
        getFields(value, ...keys);
        break;
      }
    }
  }
  return accessorArray;
}
