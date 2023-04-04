import { DependencyList, useEffect } from 'react';

export const useOnlineEffect = (
  fn: (...args: unknown[]) => unknown,
  deps?: DependencyList
) => {
  useEffect(() => {
    globalThis.addEventListener?.('online', fn);

    return () => {
      globalThis.removeEventListener?.('online', fn);
    };
  }, deps);
};
