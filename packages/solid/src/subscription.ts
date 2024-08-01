import { debounceMicrotask } from 'debounce-microtasks';
import type { BaseGeneratedSchema, Client } from 'gqty';
import { createSignal, onCleanup, type Accessor } from 'solid-js';
import type { CommonOptions, DefaultOptions, SolidClientOptions } from '.';

export type CreateSubscription<TSchema extends BaseGeneratedSchema> = (
  options?: CreateSubscriptionOptions
) => Accessor<TSchema['subscription']>;

export type CreateSubscriptionOptions = CommonOptions &
  DefaultOptions & {
    onSubscribe?: (unsubscribe: () => void) => void;
    onComplete?: () => void;
    onError?: (error: Error) => void;
  };

export const createSubscription =
  <TSchema extends BaseGeneratedSchema>(
    client: Client<TSchema>,
    options?: SolidClientOptions
  ): CreateSubscription<TSchema> =>
  ({
    cachePolicy = options?.defaults?.cachePolicy,
    extensions,
    retryPolicy = options?.defaults?.retryPolicy,
    operationName,
    onSubscribe,
    onComplete,
    onError = (error: Error) => {
      throw error;
    },
  } = {}) => {
    let unsubscribeFetch: (() => void) | undefined;

    const { accessor, selections, subscribe } = client.createResolver({
      cachePolicy,
      extensions,
      retryPolicy,
      operationName,
      onSubscribe,
      // Resubscribe every time selections are changed and is not empty.
      onSelect: debounceMicrotask(
        () => {
          if (selections.size === 0) {
            return;
          }

          unsubscribeFetch?.();
          unsubscribeFetch = subscribe({
            onNext: () => trigger(),
            onError,
            onComplete,
          });
        },
        { limitAction: 'ignore' }
      ),
    });

    onCleanup(() => {
      unsubscribeFetch?.();
    });

    const [track, trigger] = createSignal(undefined, { equals: false });

    return () => {
      track();

      return accessor.subscription;
    };
  };
