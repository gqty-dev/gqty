import { useEffect } from 'react';

export type UseFocusChangeEffectOptions = {
  enabled?: boolean;
};

export const useWindowFocusEffect = (
  fn: (...args: unknown[]) => unknown,
  { enabled = true }: UseFocusChangeEffectOptions = {}
) => {
  useEffect(() => {
    if (!enabled) return;

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
  }, [enabled, fn]);
};
