import {
  GQtyError,
  LegacySelection as Selection,
  LegacySubscribeEvents as SubscribeEvents,
  LegacySubscriptionsClient as SubscriptionsClient,
} from 'gqty';

import {
  Client,
  ClientOptions,
  OperationCallback,
} from './subscription/client';

export interface SubscriptionsClientOptions extends ClientOptions {
  wsEndpoint: string | (() => string | Promise<string>);
}

export type PossiblePromise<T> = Promise<T> | T;

type SubContext = {
  selections: Selection[];
  query: string;
  variables: Record<string, unknown> | undefined;
  operationId: string;
};

export function createSubscriptionsClient({
  wsEndpoint,
  ...options
}: SubscriptionsClientOptions): SubscriptionsClient {
  const wsClient =
    typeof wsEndpoint === 'string'
      ? new Client(wsEndpoint, options)
      : Promise.resolve()
          .then(wsEndpoint)
          .then((wsEndpoint) => new Client(wsEndpoint, options));

  const subscriptionsSelections: Map<string, Set<Selection>> = new Map();

  const eventsReference = new WeakMap<
    ((ctx: SubContext) => SubscribeEvents) | SubscribeEvents,
    OperationCallback
  >();

  return {
    subscribe({ query, variables, events, cacheKey, selections }) {
      let operationId: string = 'NO_ID';
      const ctx: SubContext = {
        query,
        variables,
        operationId,
        selections,
      };

      wsClient;

      return wsClient instanceof Promise
        ? Promise.resolve()
            .then(() => wsClient)
            .then(execSubscribe)
        : execSubscribe(wsClient);

      function execSubscribe(
        wsSubClient: Client
      ): ReturnType<SubscriptionsClient['subscribe']> {
        let callback: OperationCallback | undefined;

        if (!(callback = eventsReference.get(events))) {
          const { onData, onError, onComplete, onStart } =
            typeof events === 'function' ? events(ctx) : events;

          callback = function ({ payload, operationId }) {
            ctx.operationId = operationId;
            switch (payload) {
              case 'start':
                onStart?.();
                break;
              case 'complete':
                subscriptionsSelections.delete(operationId);
                onComplete?.();
                break;
              default:
                const { data, errors } = payload;
                if (errors?.length) {
                  onError({
                    data,
                    error: GQtyError.fromGraphQLErrors(errors),
                  });
                } else if (data) {
                  onData(data);
                }
            }
          };
          eventsReference.set(events, callback);
        }

        const operationIdPromise = wsSubClient.createSubscription(
          query,
          variables,
          callback,
          cacheKey
        );

        if (operationIdPromise instanceof Promise) {
          return operationIdPromise.then((id) => {
            ctx.operationId = operationId = id;
            return returnSub(id);
          });
        } else {
          ctx.operationId = operationId = operationIdPromise;
          return returnSub(operationId);
        }

        function returnSub(operationId: string) {
          const unsubscribe = async () => {
            await wsSubClient.unsubscribe(operationId);
            subscriptionsSelections.delete(operationId);
          };
          subscriptionsSelections.set(operationId, new Set(selections));

          return {
            unsubscribe,
            operationId,
          };
        }
      }
    },
    async unsubscribe(selections) {
      const client = await wsClient;
      let promises: Promise<void>[] = [];
      const operationIds: string[] = [];

      checkOperations: for (const [
        operationId,
        operationSelections,
      ] of subscriptionsSelections.entries()) {
        for (const selection of selections) {
          if (operationSelections.has(selection)) {
            operationIds.push(operationId);
            promises.push(client.unsubscribe(operationId));
            subscriptionsSelections.delete(operationId);
            continue checkOperations;
          }
        }
      }

      if (promises.length) await Promise.all(promises);

      return operationIds;
    },
    async close() {
      const client = await wsClient;
      client.close();
    },
    async setConnectionParams(connectionParams, restartClient) {
      const client = await wsClient;

      client.connectionInitPayload =
        typeof connectionParams === 'function'
          ? await connectionParams()
          : connectionParams;

      if (restartClient && client.socket) {
        client.close(true);
      }
    },
  };
}
