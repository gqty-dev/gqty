import memoize from 'just-memoize';
import objectHash from 'object-hash';

/**
 * Memoized hash function, with a prefix to avoid starting with a number.
 */
export const hash = memoize((...args: unknown[]) =>
  objectHash(args).replace(/^(\d)/, 'a$1')
);
