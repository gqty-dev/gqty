import { GQtyError } from './Error';
import { hash } from './Utils/hash';

const createSymbol = Symbol();

const aliasGenerator = {
  seq: 0,
  map: new WeakMap<object, number>(),
  hash,
  get(key: string | number, input: Record<string, unknown>) {
    const hash = this.hash({ key, ...input });
    if (hash) return hash;

    const seq = this.map.get(input) ?? this.seq++;

    // Sane use cases shouldn't hit this
    if (seq >= Number.MAX_SAFE_INTEGER) {
      throw new GQtyError(`selection alias fallback overflow`);
    }

    this.map.set(input, seq);

    return `alias${seq}`;
  },
};

export type SelectionOptions = {
  readonly alias?: string;
  readonly aliasLength?: number;
  readonly input?: SelectionInput;
  readonly isUnion?: boolean;
  readonly parent?: Selection;
};

export type SelectionInput = {
  readonly types: Record<string, string>;
  readonly values: Record<string, unknown>;
};

export type SelectionSnapshot = Array<
  [string | number, SelectionOptions] | [string | number]
>;

/** Global map tracking active fetches per cache key */
const fetchingCacheKeys = new Map<string, number>();

export const isFetchingCacheKey = (cacheKey: string) =>
  fetchingCacheKeys.has(cacheKey);

export const incrementFetchingCacheKey = (cacheKey: string) => {
  fetchingCacheKeys.set(cacheKey, (fetchingCacheKeys.get(cacheKey) ?? 0) + 1);
};

export const decrementFetchingCacheKey = (cacheKey: string) => {
  const count = (fetchingCacheKeys.get(cacheKey) ?? 0) - 1;
  if (count <= 0) {
    fetchingCacheKeys.delete(cacheKey);
  } else {
    fetchingCacheKeys.set(cacheKey, count);
  }
};

export class Selection {
  readonly children = new Map<string | number, Selection>();

  constructor(
    readonly key: string | number,
    readonly options: SelectionOptions = {},
    token?: symbol
  ) {
    if (token !== createSymbol) {
      throw new GQtyError(`Use Selection.createRoot() instead.`);
    }
  }

  get alias() {
    return this.options.alias;
  }

  get aliasLength(): number | undefined {
    return this.options.aliasLength ?? this.parent?.aliasLength ?? 6;
  }

  get input() {
    return this.options.input;
  }

  /** Indicates current selection being a inteface/union key. */
  get isUnion() {
    return this.options.isUnion ?? false;
  }

  get parent() {
    return this.options.parent;
  }

  get root(): Selection {
    return this.options.parent?.root ?? this;
  }

  get cacheKeys(): string[] {
    const keys = this.parent?.cacheKeys ?? [];

    if (
      typeof this.key === 'number' ||
      this.key === '$on' ||
      this.parent?.key === '$on'
    ) {
      return keys;
    }

    return keys.concat(this.alias ?? this.key);
  }

  /** The selection path from root the leaf as an array. */
  get ancestry() {
    const ancestry: Selection[] = [];
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let node: Selection | undefined = this;

    do {
      ancestry.unshift(node);
    } while ((node = node.parent));

    return ancestry;
  }

  static createRoot(key: string, options?: SelectionOptions) {
    return new Selection(key, options, createSymbol);
  }

  getChild(key: string | number, options?: SelectionOptions) {
    const alias =
      options?.alias ??
      (options?.input
        ? aliasGenerator
            .get(key, options.input)
            .slice(0, options?.aliasLength ?? this.aliasLength)
        : undefined);
    const hashKey = alias ?? key.toString();

    const selection =
      this.children.get(hashKey) ??
      new Selection(key, { ...options, alias, parent: this }, createSymbol);

    this.children.set(hashKey, selection);

    return selection;
  }

  getLeafNodes(this: Selection) {
    const result = new Set<Selection>();
    const stack = new Set([this]);
    for (const selection of stack) {
      if (selection.children.size === 0) {
        result.add(selection);
      } else {
        for (const [, child] of selection.children) stack.add(child);
      }
    }

    return result;
  }

  toJSON(): SelectionSnapshot {
    return this.ancestry.map(({ key, isUnion, input, options }) => {
      if (isUnion) {
        return [key, { isUnion, ...options }];
      } else if (input) {
        return [key, { input }];
      } else {
        return [key];
      }
    });
  }

  fromJSON(this: Selection, json: SelectionSnapshot) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let node = this;

    for (const [key, options] of json) {
      node = node.getChild(key, options);
    }

    return node;
  }

  get [Symbol.toStringTag]() {
    return 'Selection';
  }

  toString() {
    return `Selection(${this.cacheKeys.join('.')}) ${JSON.stringify(
      this.input?.values ?? {}
    )}`;
  }
}
