import type { ExecutionResult } from 'graphql';
import type { Client, Sink, SubscribePayload } from 'graphql-ws';
import type { Promisable } from 'type-fest';
import type { GQtyError } from '../../Error';
import type { LegacySelection as Selection } from './selection';

export type LegacySubscriptionsClient = {
  subscribe(opts: {
    query: string;
    variables: Record<string, unknown> | undefined;
    selections: Selection[];
    events:
      | ((ctx: {
          selections: Selection[];
          query: string;
          variables: Record<string, unknown> | undefined;
          operationId: string;
        }) => LegacySubscribeEvents)
      | LegacySubscribeEvents;
    cacheKey?: string;
  }): Promisable<{
    unsubscribe: () => Promise<void>;
    operationId: string;
  }>;
  unsubscribe(selections: Selection[] | Set<Selection>): Promise<string[]>;
  close(): Promise<void>;
  setConnectionParams(
    connectionParams:
      | (() => Promisable<Record<string, unknown>>)
      | Record<string, unknown>,
    restartClient?: boolean
  ): void;
};

export interface LegacySubscribeEvents {
  onData: (data: Record<string, unknown>) => void;
  onError: (payload: {
    error: GQtyError;
    data: Record<string, unknown> | null;
  }) => void;
  onStart?: () => void;
  onComplete?: () => void;
}

export const createLegacySubscriptionsClient = (
  subscriptionsClient: LegacySubscriptionsClient
): Client => ({
  subscribe: <
    TData = Record<string, unknown>,
    TExtensions = Record<string, unknown>
  >(
    { query, variables }: SubscribePayload,
    sink: Sink<ExecutionResult<TData, TExtensions>>
  ) => {
    const maybePromise = subscriptionsClient.subscribe({
      query,
      variables: variables ?? {},
      selections: [],
      events: {
        onComplete: () => {
          sink.complete();
        },
        onData: (result) => {
          sink.next(result);
        },
        onError({ data, error }) {
          // No data or unknown error
          if ((error && !error.graphQLErrors?.length) || !data) {
            sink.error(error.otherError ?? error);
          } else {
            sink.next({ data: data as TData, errors: error.graphQLErrors });
          }
        },
      },
    });

    return () => {
      if (maybePromise instanceof Promise) {
        maybePromise.then(({ unsubscribe }) => {
          unsubscribe();
        });
      } else {
        (maybePromise as any).unsubscribe();
      }
    };
  },
  dispose: () => {
    subscriptionsClient.close();
  },
  terminate: () => {
    subscriptionsClient.close();
  },
  on: () => () => {},
});
