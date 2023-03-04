import set from 'just-safe-set';
import type { Selection } from '../Selection';

export const pick = (
  schema: Record<string, any>,
  selections: Set<Selection>
) => {
  const result: Record<string, any> = {};

  for (const { ancestry, cacheKeys } of selections) {
    let node = schema;
    for (const { key, input } of ancestry) {
      if (input) {
        node = node[key](input.values);
      } else {
        node = node[key];
      }
    }

    if (node !== undefined) {
      set(result, cacheKeys, node);
    }
  }

  return result;
};

// TODO: support arrays
