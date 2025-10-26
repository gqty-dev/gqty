import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { DependencyList, EffectCallback } from 'react';

export function useRerender() {
  const [, setState] = useState(0);

  return useCallback(() => {
    setState((value) => (value + 1) % Number.MAX_SAFE_INTEGER);
  }, []);
}

export function useSyncedRef<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;

  return useMemo(
    () =>
      Object.freeze({
        get current() {
          return ref.current;
        },
      }),
    []
  );
}

export function useUnmountEffect(effect: () => void) {
  const effectRef = useSyncedRef(effect);

  useEffect(
    () => () => {
      effectRef.current();
    },
    []
  );
}

export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: DependencyList,
  delay: number,
  noTrailing = false
) {
  const timeout = useRef<ReturnType<typeof setTimeout>>();
  const lastCall = useRef<{
    args: Parameters<T>;
    this: ThisParameterType<T>;
  }>();

  useUnmountEffect(() => {
    if (timeout.current !== undefined) {
      clearTimeout(timeout.current);
      timeout.current = undefined;
    }
  });

  return useMemo(() => {
    const execute = (context: ThisParameterType<T>, args: Parameters<T>) => {
      lastCall.current = undefined;
      callback.apply(context, args);
      timeout.current = setTimeout(() => {
        timeout.current = undefined;

        if (!noTrailing && lastCall.current) {
          execute(lastCall.current.this, lastCall.current.args);
        }
      }, delay);
    };

    const wrapped = function (
      this: ThisParameterType<T>,
      ...args: Parameters<T>
    ) {
      if (timeout.current !== undefined) {
        lastCall.current = { args, this: this };
        return;
      }

      execute(this, args);
    } as T;

    Object.defineProperties(wrapped, {
      length: { value: callback.length },
      name: { value: `${callback.name || 'anonymous'}__throttled__${delay}` },
    });

    return wrapped;
  }, [callback, delay, noTrailing, ...deps]);
}

export function useIntervalEffect(callback: () => void, ms?: number) {
  const cbRef = useSyncedRef(callback);

  useEffect(() => {
    if (!ms && ms !== 0) return;

    const id = setInterval(() => {
      cbRef.current();
    }, ms);

    return () => {
      clearInterval(id);
    };
  }, [ms]);
}

export function usePrevious<T>(value: T) {
  const prev = useRef<T>();

  useEffect(() => {
    prev.current = value;
  });

  return prev.current;
}

export function useUpdateEffect(effect: EffectCallback, deps?: DependencyList) {
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    return effect();
  }, deps);
}
