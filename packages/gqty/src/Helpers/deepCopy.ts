export const deepCopy = <T>(value: T, seen = new WeakSet()): Readonly<T> => {
  if (typeof value == 'object' && value !== null) {
    if (seen.has(value)) {
      return value;
    }

    seen.add(value);

    if (Array.isArray(value)) {
      return value.map((value) => deepCopy(value, seen)) as T;
    }

    let data = value as any;
    if (typeof data.toJSON === 'function') {
      data = data.toJSON();
    }

    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, deepCopy(value, seen)])
    ) as T;
  }

  return value;
};
