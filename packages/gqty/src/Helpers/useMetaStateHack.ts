import type { Selection } from '../Selection';

const retryEventListeners = new Set<(event: RetryEvent) => void>();

export type RetryEvent = {
  readonly promise: Promise<unknown>;
  readonly selections: Set<Selection>;
  readonly isLastTry: boolean;
};

export const notifyRetry = (
  promise: Promise<unknown>,
  selections: Set<Selection>,
  isLastTry = false
) => {
  for (const listener of retryEventListeners) {
    listener({ promise, selections, isLastTry });
  }
};

export const subscribeRetry = (callback: (event: RetryEvent) => void) => {
  retryEventListeners.add(callback);

  return () => {
    retryEventListeners.delete(callback);
  };
};

const fetchEventListeners = new Set<(event: FetchEvent) => void>();

export type FetchEvent = {
  readonly promise: Promise<unknown>;
  readonly selections: Set<Selection>;
};

export const notifyFetch = (
  promise: Promise<unknown>,
  selections: Set<Selection>
) => {
  for (const listener of fetchEventListeners) {
    listener({ promise, selections });
  }
};

export const subscribeFetch = (callback: (event: FetchEvent) => void) => {
  fetchEventListeners.add(callback);

  return () => {
    fetchEventListeners.delete(callback);
  };
};
