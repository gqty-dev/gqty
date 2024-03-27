import type { CacheDataContainer, CacheNode } from '../Cache';
import type { SchemaContext } from '../Client';
import type { Type } from '../Schema';
import type { Selection } from '../Selection';

export type Meta = {
  context: SchemaContext;
  cache: CacheDataContainer<CacheNode>;
  selection: Selection;
  /** Object type definition from the geneated schema. */
  type: Type;
};

/** Pun-intended, a universe of metadata. */
const metaverse = new WeakMap<object, Meta>();

export const $setMeta = (accessor: object, meta: Meta) => {
  metaverse.set(accessor, meta);
};

export const $meta = <T extends object>(accessor: T) => metaverse.get(accessor);
