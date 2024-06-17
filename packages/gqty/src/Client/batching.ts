import type { Cache } from '../Cache';
import type { Selection } from '../Selection';

const pendingSelections = new Map<Cache, Map<string, Set<Set<Selection>>>>();

export const addSelections = (
  cache: Cache,
  key: string,
  selections: Set<Selection>
) => {
  if (!pendingSelections.has(cache)) {
    pendingSelections.set(cache, new Map());
  }

  const selectionsByKey = pendingSelections.get(cache)!;

  if (!selectionsByKey.has(key)) {
    selectionsByKey.set(key, new Set());
  }

  return selectionsByKey.get(key)!.add(selections);
};

export const getSelectionsSet = (cache: Cache, key: string) =>
  pendingSelections.get(cache)?.get(key);

export const delSelectionSet = (cache: Cache, key: string) =>
  pendingSelections.get(cache)?.delete(key) ?? false;

export const popSelectionsSet = (cache: Cache, key: string) => {
  const result = getSelectionsSet(cache, key);

  delSelectionSet(cache, key);

  return result;
};
