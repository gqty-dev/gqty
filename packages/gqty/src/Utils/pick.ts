import type { Selection } from '../Selection';

/** Similiar to the `select()` helper, but for accessor proxies. */
export const pick = (
  schema: Record<string, any>,
  selections: Set<Selection>
) => {
  const result: Record<string, any> = {};

  for (const { ancestry } of selections) {
    let srcNode = schema;
    for (const { key, inputValues } of ancestry) {
      if (srcNode == null) break;

      if (typeof srcNode[key] === 'function') {
        srcNode = srcNode[key](inputValues);
      } else {
        srcNode = srcNode[key];
      }
    }

    if (srcNode !== undefined) {
      let dstNode = result;

      for (let i = 0; i < ancestry.length - 1; i++) {
        if (!dstNode) break;

        const { key } = ancestry[i];
        const { key: nextKey } = ancestry[i + 1];

        if (
          typeof nextKey === 'number' &&
          (!dstNode[key] || !Array.isArray(dstNode[key]))
        ) {
          dstNode[key] = [];
        } else if (!dstNode[key]) {
          dstNode[key] = {};
        }

        dstNode = dstNode[key];
      }

      if (dstNode) {
        dstNode[ancestry[ancestry.length - 1].key] = srcNode;
      }
    }
  }

  return result;
};
