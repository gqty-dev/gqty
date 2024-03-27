/**
 * An in-memory store for useSyncExternalStore.
 */
export const createMemoryStore = <T>(initialValue: T) => {
  let state = Object.freeze({ ...initialValue });
  const listeners = new Set<() => void>();

  return {
    add: (value: Partial<T>) => {
      state = Object.freeze({ ...state, ...value });
      listeners.forEach((listener) => listener());
    },
    get: () => state,
    set: (value: T) => {
      state = Object.freeze({ ...value });
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
};
