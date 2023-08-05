import { GQtyError } from '../Error';
import { hash } from '../Utils/hash';

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
    if (seq > Number.MAX_SAFE_INTEGER) {
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

export class Selection {
  readonly alias?: string;
  readonly cacheKeys: string[] = [];
  readonly children = new Map<string | number, Selection>();
  readonly input?: SelectionInput;
  readonly parent?: Selection;
  readonly root: Selection;

  /** Indicates current selection being a inteface/union key. */
  readonly isUnion: boolean;

  constructor(
    readonly key: string | number,
    { input, alias, isUnion = false, parent }: SelectionOptions = {},
    token?: symbol
  ) {
    if (token !== createSymbol) {
      throw new GQtyError(`Use Selection.createRoot() instead.`);
    }

    this.alias = alias;
    this.input = input;
    this.isUnion = isUnion;
    this.parent = parent;
    this.root = parent?.root ?? this;

    if (typeof key === 'number' || key === '$on' || parent?.key === '$on') {
      this.cacheKeys = parent?.cacheKeys ?? [];
    } else {
      this.cacheKeys = (parent?.cacheKeys ?? []).concat(this.alias || key);
    }
  }

  /** The selection path from root the leaf as an array. */
  get ancestry() {
    const ancestry: Selection[] = [];
    let current: Selection | undefined = this;

    do {
      ancestry.unshift(current);
    } while ((current = current.parent));

    return ancestry;
  }

  static createRoot(key: string) {
    return new Selection(key, {}, createSymbol);
  }

  getChild(key: string | number, options?: SelectionOptions) {
    const alias =
      options?.alias ??
      (options?.input
        ? aliasGenerator
            .get(key, options.input)
            .slice(0, options.aliasLength ?? 5)
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
    return this.ancestry.map(({ key, isUnion, input }) => {
      if (isUnion) {
        return [key, { isUnion }];
      } else if (input) {
        return [key, { input }];
      } else {
        return [key];
      }
    });
  }

  fromJSON(this: Selection, json: SelectionSnapshot) {
    let node = this;
    for (const [key, options] of json) {
      node = node.getChild(key, options);
    }

    return node;
  }
}
