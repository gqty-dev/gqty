import type { CacheNode } from '../Cache';

/**
 * Similar to _.get() but dots goes into arrays, JSONata, JSONPath and JMESPath
 * does similar things but overkill.
 */
export function select(
  node: CacheNode,
  path: string[],
  /**
   * Optional callback, invoked each time a path segment can be successfully
   * traversed downwards. The callback can return a new node value to replace
   * the current node, return `undefined` to essentially terminate the
   * traversal.
   */
  onNext?: (node: CacheNode, path: string[]) => CacheNode
): CacheNode {
  const probedNode = onNext ? onNext(node, path) : node;

  if (path.length === 0) {
    return node;
  }
  // Exit when there are still sub-paths but scalars are reached
  else if (probedNode == null || typeof probedNode !== 'object') {
    return undefined;
  }

  if (Array.isArray(probedNode)) {
    return probedNode.map((item) => select(item, path, onNext));
  }

  const [key, ...rest] = path;

  return select(probedNode[key], rest, onNext);
}
