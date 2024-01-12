import type { CacheObject } from '.';

export const isCacheObject = (value: unknown): value is CacheObject => {
  if (value === null || typeof value !== 'object' || Array.isArray(value))
    return false;

  const obj = value as CacheObject;
  if (obj.__typename && typeof obj.__typename !== 'string') return false;

  return true;
};

export const isCacheObjectArray = (value: unknown): value is CacheObject[] =>
  Array.isArray(value) && value.every(isCacheObject);
