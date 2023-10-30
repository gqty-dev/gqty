export type FrailContainer<V> = WeakRef<{ data: V }> | StrongRef<{ data: V }>;

export type SetOptions = {
  /** Use strong reference for this value. */
  strong?: boolean;
};

/** As oppose to WeakRef */
class StrongRef<T extends object> {
  #data: T;
  constructor(data: T) {
    this.#data = data;
  }
  deref() {
    return this.#data;
  }
}

/**
 * Strong limbs with a weak grab, a WeakMap that supports scalars.
 *
 * `size` will not be updated until a disposed object is accessed via one of
 * these methods: get, entries, forEach, keys or values.
 */
export class FrailMap<K, V> extends Map<K, V> {
  constructor(entries?: readonly (readonly [K, V])[] | null) {
    super();

    if (entries) {
      for (const [k, v] of entries) {
        this.set(k, v);
      }
    }
  }

  get(key: K) {
    const ref = super.get(key) as FrailContainer<V> | undefined;
    const val = ref?.deref();
    if (val === undefined) {
      this.delete(key);
      return;
    }

    return val.data;
  }
  has(key: K) {
    return super.has(key) && this.get(key) !== undefined;
  }
  set(key: K, value: V, options?: SetOptions) {
    return super.set(
      key,
      (options?.strong || typeof WeakRef === 'undefined'
        ? new StrongRef({ data: value })
        : new WeakRef({ data: value })) as V
    );
  }

  forEach(
    callbackfn: (value: V, key: K, map: Map<K, V>) => void,
    thisArg?: any
  ) {
    super.forEach((container, k) => {
      const ref = (container as FrailContainer<V>).deref();
      if (ref !== undefined) {
        callbackfn.call(thisArg, ref.data, k, this);
      } else {
        this.delete(k);
      }
    });
  }
  entries() {
    const map = new Map<K, V>();
    this.forEach((v, k) => {
      map.set(k, v);
    });
    return map.entries();
  }
  keys() {
    const keys = new Set<K>();
    this.forEach((_, k) => {
      keys.add(k);
    });
    return keys.values();
  }
  values() {
    const keys = new Set<V>();
    this.forEach((v) => {
      keys.add(v);
    });
    return keys.values();
  }
  [Symbol.iterator]() {
    return this.entries();
  }
  get [Symbol.toStringTag]() {
    return 'FrailMap';
  }
  toJSON() {
    const json: Record<string, any> = {};
    this.forEach((v, k) => {
      json[k as string] = v;
    });
    return json;
  }
}
