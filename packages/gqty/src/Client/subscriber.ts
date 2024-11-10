import type { Client as SseClient } from 'graphql-sse';
import type { Client as WsClient } from 'graphql-ws';

export const isWsClient = (client?: SseClient | WsClient): client is WsClient =>
  client !== undefined && typeof (client as WsClient).on === 'function';

export type GQtyWsClient = WsClient & {
  isOnline?: boolean;

  /**
   * Subscription listeners to be called when the client is online, or called
   * immediately when the client is already online.
   */
  onSubscribe: (fn: () => void) => void;
};

/**
 * Warning: If the WebSocket is already connected before this funciton is
 * called, the `onSubscribe` will not be called until next connected event.
 */
export const createSubscriber = (input: WsClient): GQtyWsClient => {
  const client = input as GQtyWsClient;

  // Prevent double initialization
  if (client.onSubscribe !== undefined) {
    return client;
  }

  const listeners: Array<() => void> = [];

  client.on('connected', () => {
    if (!client.isOnline) {
      client.isOnline = true;
      listeners.forEach((fn) => fn());
      listeners.length = 0;
    }
  });

  client.on('closed', () => {
    client.isOnline = false;
  });

  client.onSubscribe = (fn: () => void) => {
    if (client.isOnline) {
      fn();
    } else {
      listeners.push(fn);
    }
  };

  return client;
};
