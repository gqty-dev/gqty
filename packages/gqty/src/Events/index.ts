import type { ExecutionResult } from 'graphql';

import type { CacheType } from '../Cache';
import type { GQtyError } from '../Error';
import type { Selection } from '../Selection';

export interface FetchEventData {
  label?: string;
  executionResult?: Pick<ExecutionResult, 'data' | 'extensions'>;
  error?: GQtyError;
  query: string;
  variables: Record<string, unknown> | undefined;
  cacheSnapshot: CacheType;
  selections: Selection[];
  type: 'query' | 'mutation' | 'subscription';
}

export interface CacheChangeEventData {
  selection: Selection;
  data: unknown;
}

interface OnFetchEventFn {
  (data: Promise<FetchEventData>, selections: Selection[]): void;
}

interface OnCacheChangeEventFn {
  (data: CacheChangeEventData): void;
}

export class EventHandler {
  public hasFetchSubscribers = false;
  private onFetchListeners = new Set<OnFetchEventFn>();
  private onCacheChangeListeners = new Set<OnCacheChangeEventFn>();

  public sendCacheChange(data: CacheChangeEventData) {
    for (const listener of this.onCacheChangeListeners) {
      listener(data);
    }
  }

  public sendFetchPromise(
    data: Promise<FetchEventData>,
    selections: Selection[]
  ) {
    for (const listener of this.onFetchListeners) {
      listener(data, selections);
    }
  }

  public onCacheChangeSubscribe(fn: OnCacheChangeEventFn) {
    this.onCacheChangeListeners.add(fn);

    return () => {
      this.onCacheChangeListeners.delete(fn);
    };
  }

  public onFetchSubscribe(fn: OnFetchEventFn) {
    this.onFetchListeners.add(fn);
    this.hasFetchSubscribers = this.onFetchListeners.size > 0;

    return () => {
      this.onFetchListeners.delete(fn);
      this.hasFetchSubscribers = this.onFetchListeners.size > 0;
    };
  }
}
