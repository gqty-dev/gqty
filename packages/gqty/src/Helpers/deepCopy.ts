import { parse, stringify } from 'flatted';

export const deepCopy = <T>(value: T): Readonly<T> =>
  Object.freeze(parse(stringify(value)));
