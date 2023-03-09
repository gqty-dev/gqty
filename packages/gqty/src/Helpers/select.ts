import type { CacheNode } from '../Cache';

/**
 * Similar to _.get() but dots goes into arrays.
 *
 * JSONata, JSONPath and JMESPath does similar things but they're overkill here.
 */
export function select(node: CacheNode, path: string[]): CacheNode {
  if (node == null || typeof node !== 'object' || path.length === 0) {
    return node;
  }

  if (Array.isArray(node)) {
    return node.map((item) => select(item, path));
  }

  const [key, ...rest] = path;

  return select(node[key], rest);
}
