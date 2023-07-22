import set from 'just-safe-set';
import type { Selection } from '../Selection';

/** Similiar to the `select()` helper, but for accessor proxies. */
export const pick = (
  schema: Record<string, any>,
  selections: Set<Selection>
) => {
  const result: Record<string, any> = {};

  for (const { ancestry } of selections) {
    let node = schema;
    for (const { key, input } of ancestry) {
      if (node == null) break;

      if (input) {
        node = node[key](input.values);
      } else {
        node = node[key];
      }
    }

    if (node !== undefined) {
      set(result, ancestry.map((s) => s.alias ?? s.key).join('.'), node);
    }
  }

  return result;
};
