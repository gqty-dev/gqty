import memoize from 'just-memoize';
import { objectHash, sha256 } from 'ohash';

/**
 * Memoized hash function, with a prefix to avoid starting with a number.
 */
export const hash = memoize((...args: unknown[]) =>
  sha256(objectHash(args, { unorderedObjects: false })).replace(/^(\d)/, 'a$1')
);
