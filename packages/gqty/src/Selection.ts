import { GQtyError } from './Error';

const createSymbol = Symbol();

export type SelectionOptions = {
  readonly alias?: string;
  readonly input?: SelectionInput;
  readonly isUnion?: boolean;
  readonly parent?: Selection;
};

export type SelectionInput = Record<
  string,
  {
    alias?: string;
    type: string;
    value: unknown;
  }
>;

export type SelectionSnapshot = Array<
  [string | number, SelectionOptions] | [string | number]
>;

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
    const hashKey = options?.alias ?? key.toString();

    const selection =
      this.children.get(hashKey) ??
      new Selection(key, { ...options, parent: this }, createSymbol);

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
