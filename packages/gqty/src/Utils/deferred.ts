import createDeferred, { type DeferredPromise } from 'p-defer';

const asyncItDoneMessage = { done: true } as IteratorResult<never>;

export type DeferredIterator<T> = AsyncGenerator<T, void, unknown> & {
  send: (value: T) => void;
  complete: () => void;
};

export const createDeferredIterator = <T>(): DeferredIterator<T> => {
  let deferred: DeferredPromise<void> | undefined = createDeferred<void>();
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
    async [Symbol.asyncDispose]() {
      await this.return();
    },
  };
};
