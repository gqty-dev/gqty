import type { Selection } from '../Selection';
import { isObject } from '../Utils';

function getFirstNonNullValue<T>(list: T[]): T | void {
  for (const value of list) if (value != null) return value;
}

export interface PrepassObjKey {
  field: string;
  variables?: Record<string, unknown>;
}

export function prepass<T extends object | null | undefined>(
  v: T,
  ...keys: Array<string | Array<string | PrepassObjKey>>
): T;
export function prepass<T extends object | null | undefined>(
  v: T,
  selections: Set<Selection>
): T;
export function prepass<T extends object | null | undefined>(
  v: T,
  ...keys: Array<string | Array<string | PrepassObjKey>> | [Set<Selection>]
): T {
  if (v == null) return v;

  keys =
    keys[0] instanceof Set
      ? (keys = [...keys[0]].map((selection) => {
          return selection.ancestry.map((s) =>
            s.input
              ? {
                  field: `${s.key}`,
                  variables: s.input.values,
                }
              : `${s.key}`
          );
        }))
      : (keys as Array<string | Array<string | PrepassObjKey>>);

  for (const composedKeys of keys) {
    const separatedKeys =
      typeof composedKeys === 'string' ? composedKeys.split('.') : composedKeys;

    let obj: unknown = v;
    for (const key of separatedKeys) {
      if (obj && key) {
        const field = typeof key === 'object' ? key.field : key;
        const variables = typeof key === 'object' ? key.variables : undefined;

        if (Array.isArray(obj)) {
          const firstNonNull = getFirstNonNullValue(obj);
          if (firstNonNull) {
            obj = firstNonNull;
          } else break;
        }

        if (isObject(obj)) {
          if (field in obj) {
            const value: unknown = obj[field];

            if (typeof value === 'function') {
              obj = value(variables);
            } else {
              obj = value;
            }
          } else break;
        } else break;
      } else break;
    }
  }

  return v;
}
