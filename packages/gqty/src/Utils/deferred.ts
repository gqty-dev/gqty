export type DeferredState = 'pending' | 'resolved' | 'rejected';

export type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (error: unknown) => void;
  state: DeferredState;
};

export const createDeferred = <T>(): Deferred<T> => {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  let state: DeferredState = 'pending';
  const promise = new Promise<T>((res, rej) => {
    resolve = (value: T) => {
      state = 'resolved';
      res(value);
    };
    reject = (error: unknown) => {
      state = 'rejected';
      rej(error);
    };
  });

  return {
    promise,
    resolve,
    reject,
    state,
  };
};

const asyncItDoneMessage = { done: true } as IteratorResult<never>;

export type DeferredIterator<T> = AsyncGenerator<T, void, unknown> & {
  send: (value: T) => void;
  complete: () => void;
};

export const createDeferredIterator = <T>(): DeferredIterator<T> => {
  let deferred: Deferred<void> | undefined = createDeferred<void>();
  const events: T[] = [];

  const next = async (): Promise<IteratorResult<T>> => {
    const value = events.shift();
    if (value !== undefined) {
      return { value, done: false };
    }

    if (!deferred) {
      return asyncItDoneMessage;
    }

    await deferred.promise;

    return next();
  };

  return {
    send: (value: T) => {
      events.push(value);

      deferred?.resolve();
      deferred = createDeferred<void>();
    },
    complete: () => {
      deferred?.resolve();
      deferred = undefined;
    },
    next,
    return: async () => {
      events.splice(0, events.length);

      deferred?.resolve();
      deferred = undefined;

      return asyncItDoneMessage;
    },
    throw: async (error: Error) => {
      events.splice(0, events.length);

      deferred?.reject(error);
      deferred = undefined;

      return asyncItDoneMessage;
    },
    [Symbol.asyncIterator]() {
      return this;
    },
  };
};
