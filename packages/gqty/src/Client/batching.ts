import { type Cache } from '../Cache';
import { Selection } from '../Selection';

const pendingSelections = new Map<Cache, Map<string, Set<Set<Selection>>>>();

export const addSelections = (
  cache: Cache,
  key: string,
  value: Set<Selection>
) => {
  if (!pendingSelections.has(cache)) {
    pendingSelections.set(cache, new Map());
  }

  const selectionsByKey = pendingSelections.get(cache)!;

  if (!selectionsByKey.has(key)) {
    selectionsByKey.set(key, new Set());
  }

  return selectionsByKey.get(key)!.add(value);
};

export const getSelectionsSet = (cache: Cache, key: string) =>
  pendingSelections.get(cache)?.get(key);

export const delSelectionsSet = (cache: Cache, key: string) =>
  pendingSelections.get(cache)?.delete(key) ?? false;

export const popSelectionsSet = (cache: Cache, key: string) => {
  const result = getSelectionsSet(cache, key);

  delSelectionsSet(cache, key);

  return result;
};
