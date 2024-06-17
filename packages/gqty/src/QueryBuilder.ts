import set from 'just-safe-set';
import type { Cache } from './Cache';
import type { QueryPayload } from './Schema';
import type { Selection } from './Selection';
import { hash } from './Utils';

export type QueryBuilderOptions = {
  batchWindow: number;
  batchStrategy: 'debounce' | 'throttle';
  cache: Cache;
};

type RootType = 'query' | 'mutation' | 'subscription';

export type BuiltQuery = QueryPayload<{
  type: RootType;
  hash: string;
}>;

type SelectionTreeLeaf = Record<string, true>;
type SelectionTreeNode = {
  [key: string]: SelectionTreeNode | SelectionTreeLeaf;
};

const stringifySelectionTree = (tree: SelectionTreeNode): string =>
  Object.entries(tree)
    .sort(([a], [b]) => a.localeCompare(b))
    .reduce((prev, [key, value]) => {
      const query =
        typeof value === 'object'
          ? `${key}{${stringifySelectionTree(value as SelectionTreeNode)}}`
          : key;

      // [ ] buildQuery.test.ts wants exact output of `graphql` parse,
      // but this is not future proof and unnecessarily hits the performance.
      if (!prev || prev.endsWith('}') || prev.endsWith('{')) {
        return `${prev}${query}`;
      } else {
        return `${prev} ${query}`;
      }
    }, '');

export const buildQuery = (
  selections: Set<Selection>,
  operationName?: string
): BuiltQuery[] => {
  const roots = new Map<
    string,
    {
      args: Map<string, { type: string; value: unknown }>;
      tree: SelectionTreeNode;
    }
  >();

  const inputDedupe = new Map<object, string>();

  // TODO: Stablize variable names, maybe by sorting selections beforehand?

  for (const { ancestry } of selections) {
    const [type, field] = ancestry;

    if (typeof type.key !== 'string') continue;

    const rootKey =
      type.key === 'subscription'
        ? // Subscriptions are fetched separately
          `${type.key}.${field.alias ?? field.key}`
        : type.key;

    if (!roots.has(rootKey)) {
      roots.set(rootKey, {
        args: new Map(),
        tree: {},
      });
    }

    const root = roots.get(rootKey)!;

    set(
      root.tree,
      ancestry.reduce<string[]>((prev, s) => {
        if (
          typeof s.key === 'symbol' ||
          typeof s.key === 'number' ||
          s.key === '$on'
        ) {
          return prev;
        }

        if (s.isUnion) {
          return [...prev, `...on ${s.key}`];
        }

        const key = s.alias ? `${s.alias}:${s.key}` : s.key;
        const input = s.input;

        if (input) {
          if (!inputDedupe.has(input)) {
            const queryInputs = Object.entries(input.values)
              .map(([key, value]) => {
                const variableName = hash((s.alias ?? s.key) + '_' + key).slice(
                  0,
                  s.aliasLength
                );

                root.args.set(`${variableName}`, {
                  value,
                  type: input.types[key],
                });

                return `${key}:$${variableName}`;
              })
              .filter(Boolean)
              .join(' ');

            inputDedupe.set(input, `${key}(${queryInputs})`);
          }

          return [...prev, inputDedupe.get(input)!];
        }

        return [...prev, key];
      }, []),
      true
    );
  }

  return [...roots].map(([key, { args, tree }]) => {
    const rootKey = key.split('.')[0] as RootType;
    let query = stringifySelectionTree(tree);

    // Query variables
    if (args.size > 0) {
      query = query.replace(
        rootKey,
        `${rootKey}(${[...args.entries()]
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([name, { type }]) => `$${name}:${type}`)
          .join('')})`
      );
    }

    // Operation name
    if (operationName) {
      query = query.replace(rootKey, `${rootKey} ${operationName}`);
    }

    return {
      query,
      variables:
        args.size > 0
          ? [...args].reduce<Record<string, unknown>>(
              (prev, [key, { value }]) => ((prev[key] = value), prev),
              {}
            )
          : undefined,
      operationName,
      extensions: {
        type: rootKey,
        hash: hash({ query, variables: args }), // For query dedupe and cache keys
      },
    };
  });
};
