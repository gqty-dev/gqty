import { hash } from '../Utils/hash';

export type AliasGenerator = (
  /**
   * The chain of selection keys from query root, a unique alias is generated
   * based on they provided keys and arguments.
   *
   * @example ["query", "foo", "bar"]
   */
  keys: string[],

  /**
   * GraphQL arguments related to the current selection, a unique alias is
   * generated based on they provided keys and arguments.
   */
  args?: Record<string, unknown>
) => SelectionAlias;

export type SelectionAlias = {
  /**
   * Alias of the current selection field.
   */
  field: string;

  /**
   * Variable name to aliases mapping.
   */
  input: Record<string, string | undefined>;
};

export const createAliasHasher =
  (maxLength = Infinity): AliasGenerator =>
  (keys, args) => {
    const field = hash({ key: keys.at(-1), ...args }).slice(0, maxLength);
    const input: Record<string, string> = {};

    if (args) {
      for (const key in args) {
        input[key] = hash(`${field}_${key}`).slice(0, maxLength);
      }
    }

    return {
      field,
      input,
    };
  };

export const createDebugAliasHasher =
  (maxLength = Infinity): AliasGenerator =>
  (keys, args) => {
    const field = keys
      .concat(hash({ key: keys.at(-1), args }).slice(0, maxLength))
      .join('_');
    const input: Record<string, string> = {};

    if (args) {
      for (const key in args) {
        input[key] = keys.concat(key, field).join('_');
      }
    }

    return {
      field,
      input,
    };
  };
