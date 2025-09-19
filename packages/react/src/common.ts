import {
  $meta,
  Selection,
  castNotSkeleton,
  castNotSkeletonDeep,
  getArrayFields,
  getFields,
  prepass,
  selectFields,
  type FetchOptions,
  type GQtyError,
} from 'gqty';
import * as React from 'react';

export const IS_BROWSER =
  typeof window !== 'undefined' ||
  globalThis.navigator?.product === 'ReactNative';

export const useIsomorphicLayoutEffect = IS_BROWSER
  ? React.useLayoutEffect
  : React.useEffect;

export type LegacyFetchPolicy =
  | 'cache-and-network'
  | 'cache-first'
  | 'network-only'
  | 'no-cache';

export const legacyFetchPolicyMap: Record<
  LegacyFetchPolicy,
  FetchOptions['cachePolicy']
> = {
  'cache-first': 'force-cache',
  'network-only': 'no-cache',
  'cache-and-network': 'default',
  'no-cache': 'no-store',
};

export const translateFetchPolicy = (
  fetchPolicy: LegacyFetchPolicy
): FetchOptions['cachePolicy'] =>
  legacyFetchPolicyMap[fetchPolicy] ?? 'default';

export type SelectionsOrProxy<T> = (Selection | T)[];

export const useExtractedSelections = <T extends object>(
  input?: SelectionsOrProxy<T>
): Set<Selection> => {
  const [selections] = React.useState(() => new Set<Selection>());

  React.useEffect(() => {
    selections.clear();

    if (input === undefined) return;

    for (const it of input) {
      (it instanceof Selection ? it : $meta(it)?.selection)
        ?.getLeafNodes()
        .forEach((selection) => selections.add(selection));
    }
  }, [input, input?.length]);

  return selections;
};

export type List<T> = Set<T> | Array<T>;

export function toSetIfNeeded<T>(list: List<T>): Set<T> {
  return Array.isArray(list) ? new Set(list) : list;
}

export function isSelectionIncluded(
  selection: Selection,
  selectionList: List<Selection>
) {
  const setSelectionList = toSetIfNeeded(selectionList);

  if (setSelectionList.has(selection)) return true;

  for (const listValue of selectionList) {
    if (setSelectionList.has(listValue)) return true;
  }

  return false;
}

export function isAnySelectionIncluded(
  selectionsToCheck: List<Selection>,
  selectionsList: List<Selection>
) {
  const setSelectionList = toSetIfNeeded(selectionsList);
  for (const selection of selectionsToCheck) {
    if (isSelectionIncluded(selection, setSelectionList)) return true;
  }

  return false;
}

export function isAnySelectionIncludedInMatrix(
  selectionsToCheck: List<Selection>,
  selectionsMatrix: List<List<Selection>>
) {
  const selectionsToCheckSet = toSetIfNeeded(selectionsToCheck);

  for (const group of selectionsMatrix) {
    if (isAnySelectionIncluded(selectionsToCheckSet, group)) return true;
  }

  return false;
}

export type OnErrorHandler = (error: GQtyError) => void;

export const coreHelpers = {
  prepass,
  getFields,
  getArrayFields,
  selectFields,
  castNotSkeleton,
  castNotSkeletonDeep,
};

export function uniqBy<TNode>(
  list: TNode[],
  cb?: (node: TNode) => unknown
): TNode[] {
  const uniqList = new Map<unknown, TNode>();
  for (const value of list) {
    const key: unknown = cb ? cb(value) : value;

    if (uniqList.has(key)) continue;
    uniqList.set(key, value);
  }
  return Array.from(uniqList.values());
}

const compare = (a: string | number, b: string | number) =>
  a < b ? -1 : a > b ? 1 : 0;

export function sortBy<TNode>(
  list: TNode[],
  cb: (node: TNode) => number | string,
  order: 'asc' | 'desc' = 'asc'
): TNode[] {
  const orderedList = Array.from(list);

  orderedList.sort((a, b) => compare(cb(a), cb(b)));

  if (order === 'desc') orderedList.reverse();

  return orderedList;
}
