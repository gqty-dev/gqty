interface PubSubDeferredPromise<T> {
  promise: Promise<void>;
  resolve: () => void;
  isDone: boolean;
  values: Array<T>;
}

function pubsubDeferredPromise<T = void>(): PubSubDeferredPromise<T> {
  let resolve!: () => void;
  const promise = new Promise<void>((resolveFn) => {
    resolve = resolveFn;
  });

  return {
    promise,
    resolve,
    values: [],
    isDone: false,
  };
}

export interface PubSubEngine {
  publish<TPayload>(topic: string, payload: TPayload): void | Promise<void>;
  subscribe<TPayload>(
    ...topics: [string, ...string[]]
  ): AsyncGenerator<TPayload>;
  unsubscribe(
    ...iterators: Array<AsyncGenerator<unknown>>
  ): void | Promise<void>;
  close(): void | Promise<void>;
}

export class InMemoryPubSub implements PubSubEngine {
  protected readonly ValuePromiseMap: WeakMap<
    AsyncGenerator<unknown>,
    PubSubDeferredPromise<any>
  > = new WeakMap();

  protected readonly TopicIteratorMap: Map<
    string,
    Set<AsyncGenerator<unknown>>
  > = new Map();

  async publish<TPayload>(topic: string, payload: TPayload) {
    const { TopicIteratorMap, ValuePromiseMap } = this;
    const iteratorSet = TopicIteratorMap.get(topic);

    if (iteratorSet == null) return;

    for (const iterator of iteratorSet) {
      const valuePromise = ValuePromiseMap.get(iterator);

      if (valuePromise == null) continue;

      valuePromise.values.push(payload);

      valuePromise.resolve();
    }
  }

  subscribe<TPayload = any>(
    ...topics: [string, ...string[]]
  ): AsyncGenerator<TPayload> {
    const { ValuePromiseMap, TopicIteratorMap } = this;

    const iterator = generator();

    const iteratorSets = topics.map((topic) => {
      let iteratorSet = TopicIteratorMap.get(topic);

      if (iteratorSet == null) {
        iteratorSet = new Set();
        TopicIteratorMap.set(topic, iteratorSet);
      }

      iteratorSet.add(iterator);

      return iteratorSet;
    });

    let valuePromise: PubSubDeferredPromise<TPayload> | null | undefined =
      topics.length ? pubsubDeferredPromise() : null;

    if (valuePromise) ValuePromiseMap.set(iterator, valuePromise);

    async function* generator(): AsyncGenerator<TPayload> {
      while (valuePromise != null) {
        await valuePromise.promise;

        for (const value of valuePromise.values) yield value;

        if (valuePromise.isDone) {
          valuePromise = null;
          ValuePromiseMap.delete(iterator);
        } else {
          valuePromise = pubsubDeferredPromise();
          ValuePromiseMap.set(iterator, valuePromise);
        }
      }

      for (const iteratorSet of iteratorSets) {
        iteratorSet.delete(iterator);
      }
    }

    return iterator;
  }

  unsubscribe(...iterators: AsyncGenerator<unknown>[]) {
    const { ValuePromiseMap } = this;

    for (const iterator of iterators) {
      const valuePromise = ValuePromiseMap.get(iterator);

      if (valuePromise == null) continue;

      valuePromise.resolve();
      valuePromise.isDone = true;
      ValuePromiseMap.delete(iterator);
    }
  }

  close() {
    const { TopicIteratorMap, ValuePromiseMap } = this;
    for (const [topic, iteratorSet] of TopicIteratorMap.entries()) {
      for (const iterator of iteratorSet) {
        const valuePromise = ValuePromiseMap.get(iterator);

        if (valuePromise == null) continue;

        valuePromise.resolve();
        valuePromise.isDone = true;
        ValuePromiseMap.delete(iterator);
      }
      iteratorSet.clear();
      TopicIteratorMap.delete(topic);
    }
  }
}
