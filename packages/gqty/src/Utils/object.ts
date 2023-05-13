export type PlainObject = Record<string | number | symbol, unknown>;

export const isObject = (v: unknown): v is object =>
  v != null && typeof v === 'object';

export const isPlainObject = (v: unknown): v is PlainObject =>
  isObject(v) && !Array.isArray(v);

export function isEmptyObject(obj: object) {
  for (var _i in obj) return false;
  return true;
}

export interface ObjectWithType<Typename extends string = string>
  extends Record<string, unknown> {
  __typename: Typename;
}

export const isObjectWithType = <T extends ObjectWithType>(
  v: unknown
): v is T => isPlainObject(v) && typeof v.__typename === 'string';

/**
 * Similar to `just-extend(true, ...)` but circular references aware.
 */
export function deepAssign<T extends object>(
  target: object,
  sources: (object | undefined | null)[],
  onConflict?: (targetValue: object, sourceValue: object) => object | void
): T {
  for (const source of sources) {
    for (const [sourceKey, sourceValue] of Object.entries(source || {})) {
      if (sourceKey in target) {
        const targetValue: unknown = Reflect.get(target, sourceKey);
        if (sourceValue === targetValue) continue;

        if (isObject(sourceValue) && isObject(targetValue)) {
          const onConflictResult = onConflict?.(targetValue, sourceValue);

          if (onConflictResult === undefined) {
            Reflect.set(
              target,
              sourceKey,
              deepAssign(targetValue, [sourceValue], onConflict)
            );
          } else {
            Reflect.set(target, sourceKey, onConflictResult);
          }
          continue;
        }
      }
      Reflect.set(target, sourceKey, sourceValue);
    }
  }

  return target as T;
}
