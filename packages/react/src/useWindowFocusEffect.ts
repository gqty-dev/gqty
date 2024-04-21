import { useEffect, type DependencyList } from 'react';

export type UseFocusChangeEffectOptions = {
  enabled?: boolean;
};

export const useWindowFocusEffect = (
  fn: (...args: unknown[]) => unknown,
  deps: DependencyList = []
) => {
  useEffect(() => {
    const visibilityChangeFn = () => {
      if (globalThis.document?.visibilityState === 'visible') {
        fn();
      }
    };

    globalThis.addEventListener?.('visibilitychange', visibilityChangeFn);
    globalThis.addEventListener?.('focus', visibilityChangeFn);

    return () => {
      globalThis.removeEventListener?.('visibilitychange', visibilityChangeFn);
      globalThis.removeEventListener?.('focus', visibilityChangeFn);
    };
  }, deps.concat(fn));
};
