import { GQtyError } from '../Error';
import { debounce } from '../Utils/debounce';
import { isAnySelectionIncluded } from '../Utils/selectionsInclude';

import type { Selection } from '../Selection';
import type { InnerClientState, SubscriptionsClient } from '../Client';

export type TrackCallType = 'initial' | 'cache_change';

export interface TrackCallInfo {
  type: TrackCallType;
}

export interface TrackOptions {
  onError?: ((err: GQtyError) => void) | undefined;

  /**
   * Refetch on initial call
   */
  refetch?: boolean;
}

export interface Track {
  <Data>(callback: (info: TrackCallInfo) => Data, options?: TrackOptions): {
    stop: () => void;
    selections: Set<Selection>;
  };
}

export function createTracker(
  innerState: InnerClientState,
  subscriptionsClient: SubscriptionsClient | undefined
): {
  track: Track;
} {
  const {
    interceptorManager: { createInterceptor, removeInterceptor },
    eventHandler,
    scheduler,
    clientCache,
  } = innerState;

  function track<Data>(
    callback: (info: TrackCallInfo) => Data,
    { onError, refetch }: TrackOptions = {}
  ): {
    stop: () => void;
    selections: Set<Selection>;
  } {
    const trackerSelections = new Set<Selection>();

    let lastError: unknown;
    function callOnError(err: unknown) {
      // Don't repeat error calls with the same error instance
      if (lastError && err === lastError) return;
      lastError = err;

      onError && onError(GQtyError.create(err, callback));
    }

    function main(info: TrackCallInfo) {
      const interceptor = createInterceptor();

      interceptor.selectionAddListeners.add((selection) => {
        trackerSelections.add(selection);
      });

      const shouldRefetch = refetch && info.type === 'initial';

      try {
        if (shouldRefetch) {
          innerState.allowCache = false;
        }

        Promise.resolve(callback(info)).catch(callOnError);
      } catch (err) {
        callOnError(err);
      } finally {
        if (shouldRefetch) {
          innerState.allowCache = true;
        }

        removeInterceptor(interceptor);
      }
    }

    const isNotifying = { current: false };
    const debouncedCacheChange = debounce(() => {
      isNotifying.current = false;
      main({
        type: 'cache_change',
      });
    }, 10);

    const unsubErrors =
      onError &&
      scheduler.errors.subscribeErrors((data) => {
        switch (data.type) {
          case 'new_error': {
            if (isAnySelectionIncluded(data.selections, trackerSelections)) {
              callOnError(data.newError);
            }
            return;
          }
        }
      });

    const unsubCache = eventHandler.onCacheChangeSubscribe(({ selection }) => {
      if (isNotifying.current) return;

      if (trackerSelections.has(selection)) {
        isNotifying.current = true;
        debouncedCacheChange();
      }
    });

    const unsubFetch = eventHandler.onFetchSubscribe((promise) => {
      promise.then(({ error, selections, executionResult }) => {
        if (
          isNotifying.current ||
          !isAnySelectionIncluded(trackerSelections, selections)
        )
          return;

        error && callOnError(error);

        if (executionResult?.data) {
          isNotifying.current = true;
          debouncedCacheChange();
        }
      });
    });

    const stopSubscriptions =
      subscriptionsClient &&
      (() => {
        subscriptionsClient
          .unsubscribe(trackerSelections)
          .then((operationsIds) => {
            if (eventHandler.hasFetchSubscribers && operationsIds.length) {
              const arraySelections = Array.from(trackerSelections);
              for (const id of operationsIds) {
                eventHandler.sendFetchPromise(
                  Promise.resolve({
                    query: '',
                    variables: undefined,
                    cacheSnapshot: clientCache.cache,
                    selections: arraySelections,
                    type: 'subscription',
                    label: `[id=${id}] [unsubscribe]`,
                  }),
                  arraySelections
                );
              }
            }
          });
      });

    main({
      type: 'initial',
    });

    return {
      stop() {
        unsubCache();
        unsubFetch();
        unsubErrors?.();
        stopSubscriptions?.();
      },
      selections: trackerSelections,
    };
  }

  return { track };
}
