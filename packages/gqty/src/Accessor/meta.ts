import type { CacheDataContainer, CacheNode } from '../Cache';
import type { SchemaContext } from '../Client';
import type { Type } from '../Schema';
import type { Selection } from '../Selection';

export type Meta = {
  context: SchemaContext;
  cache: CacheDataContainer<CacheNode>;
  selection: Selection;
  /** Object type definition from the generated schema. */
  type: Type;
  isFetching: boolean;
};

/** Pun-intended, a universe of metadata. */
const metaverse = new WeakMap<object, Meta>();

export const $meta = <T extends object>(accessor: T) => metaverse.get(accessor);

$meta.set = (accessor: object, meta: Meta) => {
  metaverse.set(accessor, meta);
};
