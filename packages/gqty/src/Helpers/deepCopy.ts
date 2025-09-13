import { parse, stringify } from 'flatted';

export const deepCopy = <T>(value: T): Readonly<T> =>
  // structuredClone does not support WeakRef, fallback to serialization.
  Object.freeze(parse(stringify(value)));
