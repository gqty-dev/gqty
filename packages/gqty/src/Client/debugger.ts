import type { Cache } from '../Cache';
import type { QueryPayload } from '../Schema';
import type { Selection } from '../Selection';
import type { FetchResult, QueryExtensions } from './resolveSelections';

export type DebugEvent = {
  cache?: Cache;
  label?: string;
  request: QueryPayload<QueryExtensions>;
  result?: FetchResult;
  selections: Set<Selection>;
};

export type DebugEventListener = (event: DebugEvent) => void;

export type Debugger = {
  dispatch: (event: DebugEvent) => void;

  /** Returns an unsubscribe function */
  subscribe: (listener: DebugEventListener) => () => void;
};

export const createDebugger = () => {
  const subs = new Set<DebugEventListener>();

  return {
    dispatch: (event: DebugEvent) => {
      subs.forEach((sub) => sub(event));
    },
    subscribe: (listener: DebugEventListener) => {
      subs.add(listener);
      return () => subs.delete(listener);
    },
  };
};
