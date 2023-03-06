import type { Cache } from '../Cache';
import type { QueryPayload } from '../Schema';
import type { Selection } from '../Selection';
import type { FetchResult, QueryExtensions } from './resolveSelections';

export type DebugEvent = {
  cache?: Cache; // cacheSnapshot
  label?: string; // label
  request: QueryPayload<QueryExtensions>; // query, variables, operationName, type
  result?: FetchResult; // executionResult, error(s)
  selections: Set<Selection>; // selections
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
