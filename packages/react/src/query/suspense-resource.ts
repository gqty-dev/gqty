// 1. Define explicit interfaces for your return types
export interface SuspenseResourceCache<Key, Value> {
  get(key: Key): Value | undefined;
  set(key: Key, value: Value): void;
  has(key: Key): boolean;
  clear(): void;
  delete(key: Key): boolean;
}

export interface SuspenseResource<TResult> {
  read(): TResult;
}

// 2. Cache Implementation
export function createSuspenseResourceCache<
  Key,
  Value,
>(): SuspenseResourceCache<Key, Value> {
  const map = new Map<Key, Value>();

  return {
    get(key: Key) {
      return map.get(key);
    },
    set(key: Key, value: Value) {
      map.set(key, value);
    },
    has(key: Key) {
      return map.has(key);
    },
    clear() {
      map.clear();
    },
    delete(key: Key) {
      return map.delete(key); // Map.delete returns a boolean
    },
  };
}

// 3. Resource Implementation
export function createSuspenseResource<TResult>(
  asyncFn: () => Promise<TResult>
): SuspenseResource<TResult> {
  let status: 'pending' | 'success' | 'error' = 'pending';
  // It only holds the result or the error. The promise is stored separately.
  let result: TResult | Error;

  // The promise returned by .then() resolves to void.
  // We save this to throw it so React Suspense can catch it.
  const suspender: Promise<void> = asyncFn().then(
    (data) => {
      status = 'success';
      result = data;
    },
    (err: unknown) => {
      status = 'error';
      result = err instanceof Error ? err : new Error(String(err));
    }
  );

  return {
    read(): TResult {
      if (status === 'pending') {
        throw suspender;
      }
      if (status === 'error') {
        throw result;
      }
      // If it's not pending or error, it must be success, so it's safe to cast.
      return result as TResult;
    },
  };
}

// 4. Getter Implementation
export function getSuspenseResource<Key, TResult>(
  cache: SuspenseResourceCache<Key, SuspenseResource<TResult>>,
  key: Key,
  asyncFn: () => Promise<TResult>
): SuspenseResource<TResult> {
  if (cache.has(key)) {
    // We know it exists because of cache.has(), so we can safely use the non-null assertion (!)
    return cache.get(key)!;
  }

  const resource = createSuspenseResource(asyncFn);
  cache.set(key, resource);
  return resource;
}
