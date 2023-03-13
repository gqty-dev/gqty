import type { Promisable } from 'type-fest';
import type { GQtyError } from '../../Error';

export type LegacySubscriptionClient = {
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
        }) => SubscribeEvents)
      | SubscribeEvents;
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

export interface SubscribeEvents {
  onData: (data: Record<string, unknown>) => void;
  onError: (payload: {
    error: GQtyError;
    data: Record<string, unknown> | null;
  }) => void;
  onStart?: () => void;
  onComplete?: () => void;
}
