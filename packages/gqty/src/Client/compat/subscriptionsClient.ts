import type { ExecutionResult } from 'graphql';
import type {
  Client,
  ConnectionAckMessage,
  Event,
  EventListener,
  MessageType,
  Sink,
  SubscribeMessage,
  SubscribePayload,
} from 'graphql-ws';
import { GQtyError } from '../../Error';
import type { LegacySelection as Selection } from './selection';

type Promisable<T> = T | Promise<T>;

export type LegacySubscriptionsClient<
  TData extends Record<string, unknown> = Record<string, unknown>
> = {
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
        }) => LegacySubscribeEvents<TData>)
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

export interface LegacySubscribeEvents<
  TData extends Record<string, unknown> = Record<string, unknown>
> {
  onData: (data: TData) => void;
  onError: (payload: { error: GQtyError; data: TData | null }) => void;
  onStart?: () => void;
  onComplete?: () => void;
}

export const createLegacySubscriptionsClient = (
  subscriptionsClient: LegacySubscriptionsClient
): Client => {
  const listeners = new Map<Event, Set<(...args: unknown[]) => void>>();
  const dispatchEvent = (event: Event, ...args: unknown[]) => {
    const listenersSet = listeners.get(event);

    if (listenersSet) {
      for (const listener of listenersSet) {
        listener(...args);
      }
    }
  };

  // @ts-expect-error This type missing needs to be fixed
  const client: Client = {
    subscribe: <
      TData = Record<string, unknown>,
      TExtensions = Record<string, unknown>
    >(
      payload: SubscribePayload,
      sink: Sink<ExecutionResult<TData, TExtensions>>
    ) => {
      const maybePromise = subscriptionsClient.subscribe({
        query: payload.query,
        variables: payload.variables ?? {},
        selections: [],
        events: {
          onStart: () => {
            dispatchEvent('message', {
              type: 'connection_ack' as MessageType.ConnectionAck,
            } satisfies ConnectionAckMessage);
          },
          onComplete: () => {
            sink.complete();
          },
          onData: (data) => {
            sink.next({
              data: data as TData,
            });
          },
          onError({ data, error }) {
            // No data or unknown error
            if ((error && !error.graphQLErrors?.length) || !data) {
              sink.error(error.otherError ?? error);
            } else {
              sink.next({
                data: data as TData,
                errors: error.graphQLErrors,
              });
            }
          },
        },
      });

      let unsubscribe: (() => void) | undefined;

      if (maybePromise instanceof Promise) {
        maybePromise.then(({ operationId, unsubscribe: _unsubscribe }) => {
          unsubscribe = _unsubscribe;

          dispatchEvent('message', {
            id: operationId,
            type: 'subscribe' as MessageType.Subscribe,
            payload,
          } satisfies SubscribeMessage);
        });
      } else {
        const sub = maybePromise as Awaited<typeof maybePromise>;

        unsubscribe = sub.unsubscribe;

        dispatchEvent('message', {
          id: sub.operationId,
          type: 'subscribe' as MessageType.Subscribe,
          payload,
        } satisfies SubscribeMessage);
      }

      return () => {
        if (unsubscribe === undefined) {
          throw new GQtyError(`Subscription has not started yet.`);
        }

        unsubscribe();
        sink.complete();
      };
    },
    dispose: () => {
      subscriptionsClient.close();
    },
    terminate: () => {
      subscriptionsClient.close();
    },
    on<E extends Event>(event: E, listener: EventListener<E>) {
      // Just for convenience
      const untypedListener = listener as (...args: unknown[]) => void;
      const listenersSet = listeners.get(event) ?? new Set();

      listenersSet.add(untypedListener);
      listeners.set(event, listenersSet);

      return () => {
        listenersSet.delete(untypedListener);
      };
    },
  };

  return client;
};
