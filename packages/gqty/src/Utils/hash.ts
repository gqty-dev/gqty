import memoize from 'just-memoize';
import { hash as ohash } from 'ohash';

/**
 * Memoized hash function, with a prefix to avoid starting with a number.
 */
export const hash = memoize((...args: unknown[]) =>
  ohash(args).replace(/^(\d)/, 'a$1')
);
