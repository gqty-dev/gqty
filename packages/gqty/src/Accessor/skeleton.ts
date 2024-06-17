import type { CacheObject } from '../Cache';
import { isObject } from '../Utils';
import { $meta } from './meta';

/** These objects won't show up in JSON serialization. */
const skeletons = new WeakSet();

export const isSkeleton = (object: unknown) => {
  if (!isObject(object)) return false;

  const value = object as CacheObject;

  if (skeletons.has(value)) return true;

  const data = $meta(value)?.cache.data;

  if (!isObject(data)) return false;

  return skeletons.has(data);
};

/** Create data skeleton array/objects. */
export const createSkeleton = <T extends WeakKey>(fn: () => T) => {
  const skeleton = fn();
  skeletons.add(skeleton);
  return skeleton;
};
