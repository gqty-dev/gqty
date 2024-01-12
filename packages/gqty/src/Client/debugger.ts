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
  dispatch: (event: DebugEvent) => Promise<void>;

  /** Returns an unsubscribe function */
  subscribe: (listener: DebugEventListener) => () => void;
};

export const createDebugger = (): Debugger => {
  const subs = new Set<DebugEventListener>();

  return {
    dispatch: async (event: DebugEvent) => {
      await Promise.all([...subs].map((sub) => sub(event)));
    },

    subscribe: (listener: DebugEventListener) => {
      subs.add(listener);
      return () => subs.delete(listener);
    },
  };
};
