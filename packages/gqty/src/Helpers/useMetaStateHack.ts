import type { Selection } from '../Selection';

export class RetryEvent<TData> extends Event {
  constructor(
    readonly promise: Promise<TData>,
    readonly selections: Set<Selection>,
    readonly isLastTry = false
  ) {
    super('gqty$retry');
  }
}

export const notifyRetry = (
  promise: Promise<unknown>,
  selections: Set<Selection>,
  isLastTry = false
) => {
  globalThis.dispatchEvent?.(new RetryEvent(promise, selections, isLastTry));
};

export const subscribeRetry = (
  callback: (event: RetryEvent<unknown>) => void
) => {
  // @ts-expect-error A hack for useMetaState()
  globalThis.addEventListener?.('gqty$retry', callback);

  return () => {
    // @ts-expect-error A hack for useMetaState()
    globalThis.removeEventListener?.('gqty$retry', callback);
  };
};

export class Fetchevent<TData> extends Event {
  constructor(
    readonly promise: Promise<TData>,
    readonly selections: Set<Selection>
  ) {
    super('gqty$fetch');
  }
}

export const notifyFetch = (
  promise: Promise<unknown>,
  selections: Set<Selection>
) => {
  globalThis.dispatchEvent?.(new Fetchevent(promise, selections));
};

export const subscribeFetch = (
  callback: (event: Fetchevent<unknown>) => void
) => {
  // @ts-expect-error A hack for useMetaState()
  globalThis.addEventListener?.('gqty$fetch', callback);

  return () => {
    // @ts-expect-error A hack for useMetaState()
    globalThis.removeEventListener?.('gqty$fetch', callback);
  };
};
