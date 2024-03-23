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

export type BuiltQuery = QueryPayload<{
  type: 'query' | 'mutation' | 'subscription';
  hash: string;
}>;

type SelectionTreeLeaf = Record<string, true>;
type SelectionTreeNode = {
  [key: string]: SelectionTreeNode | SelectionTreeLeaf;
};
type SelectionTreeRoot = Record<
  'query' | 'mutation' | 'subscription',
  SelectionTreeNode
>;

type SelectionBranchEntry = [keyof SelectionTreeRoot, SelectionTreeNode];

const stringifySelectionTree = (tree: SelectionTreeNode): string =>
  Object.entries(tree)
    .sort(([a], [b]) => a.localeCompare(b))
    .reduce((prev, [key, value]) => {
      const query =
        typeof value === 'object'
          ? `${key}{${stringifySelectionTree(value as SelectionTreeNode)}}`
          : key;

      // TODO: buildQuery.test.ts wants exact output of `graphql` parse,
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
  const root = {} as SelectionTreeRoot;
  const variables = new Map<string, { type: string; value: unknown }>();
  const inputDedupe = new Map<object, string>();

  // TODO: Stablize variable names, maybe by sorting selections beforehand?

  for (const { ancestry } of selections) {
    set(
      root,
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

                variables.set(`${variableName}`, {
                  value,
                  type: input.types[key],
                });

                return `${key}:$${variableName}`;
              })
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

  // Split top level fields of subscriptions
  const branches = Object.entries(root).reduce<SelectionBranchEntry[]>(
    (prev, [key, value]) => {
      if (key !== 'subscription') {
        return [...prev, [key, value] as SelectionBranchEntry];
      }

      return [
        ...prev,
        ...Object.entries(value).map<SelectionBranchEntry>(
          ([topField, branch]) => ['subscription', { [topField]: branch }]
        ),
      ];
    },
    []
  );

  return branches.map(([key, branch]) => {
    const rootKey = key as keyof SelectionTreeRoot;
    let query = stringifySelectionTree({ [rootKey]: branch });

    // Query variables
    if (variables.size > 0) {
      query = query.replace(
        rootKey,
        `${rootKey}(${[...variables.entries()]
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
        variables.size > 0
          ? [...variables].reduce<Record<string, unknown>>(
              (prev, [key, { value }]) => ((prev[key] = value), prev),
              {}
            )
          : undefined,
      operationName,
      extensions: {
        type: rootKey,
        hash: hash({ query, variables }), // For query dedupe and cache keys
      },
    };
  });
};
