import { $meta } from './meta';

/** These objects won't show up in JSON serialization. */
const skeletons = new WeakSet<object>();

export const isSkeleton = (object: any) =>
  skeletons.has(object) || skeletons.has($meta(object)?.cache.data as object);

export const createSkeleton = <T extends object>(fn: () => T) => {
  const skeleton = fn();
  skeletons.add(skeleton);
  return skeleton;
};
