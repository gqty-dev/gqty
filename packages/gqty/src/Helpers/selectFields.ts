import get from 'just-safe-get';
import set from 'just-safe-set';
import { isObject } from '../Utils';

export function selectFields<A extends object | null | undefined>(
  accessor: A,
  fields: '*' | Array<string | number> = '*',
  recursionDepth = 1
): A {
  if (accessor == null) return accessor as A;

  if (Array.isArray(accessor)) {
    return accessor.map((value) =>
      selectFields(value, fields, recursionDepth)
    ) as A;
  } else if (!isObject(accessor)) {
    return accessor;
  } else {
    Reflect.get(accessor, '__typename');
  }

  if (fields.length === 0) {
    return {} as A;
  }

  if (typeof fields === 'string') {
    if (recursionDepth > 0) {
      const allAccessorKeys = Object.keys(accessor);
      return allAccessorKeys.reduce((acum, fieldName) => {
        const fieldValue: unknown = get(accessor, fieldName);

        if (Array.isArray(fieldValue)) {
          set(
            acum,
            fieldName,
            fieldValue.map((value) => {
              return selectFields(value, '*', recursionDepth - 1);
            })
          );
        } else if (isObject(fieldValue)) {
          set(
            acum,
            fieldName,
            selectFields(fieldValue, '*', recursionDepth - 1)
          );
        } else {
          set(acum, fieldName, fieldValue);
        }
        return acum;
      }, {} as NonNullable<A>);
    } else {
      return null as A;
    }
  }

  return fields.reduce((acum, fieldName) => {
    if (typeof fieldName === 'number') {
      fieldName = fieldName.toString();
    }

    const fieldValue = get(accessor, fieldName);

    if (fieldValue === undefined) return acum;

    if (Array.isArray(fieldValue)) {
      set(
        acum,
        fieldName,
        fieldValue.map((value) => {
          return selectFields(value, '*', recursionDepth);
        })
      );
    } else if (isObject(fieldValue)) {
      set(acum, fieldName, selectFields(fieldValue, '*', recursionDepth));
    } else {
      set(acum, fieldName, fieldValue);
    }

    return acum;
  }, {} as NonNullable<A>);
}
