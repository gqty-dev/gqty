import { useRerender } from '../hooks';
import { GQtyError, Selection, useMetaStateHack } from 'gqty';
import * as React from 'react';
import { useExtractedSelections, type SelectionsOrProxy } from '../common';

export interface UseMetaStateOptions<T extends object> {
  onStartFetching?: () => void;
  onDoneFetching?: () => void;
  onError?: (data: {
    newError: GQtyError;
    selections: Selection[];
    isLastTry: boolean;
  }) => void;
  onRetry?: (data: {
    retryPromise: Promise<unknown>;
    selections: Set<Selection>;
  }) => void;
  filterSelections?: SelectionsOrProxy<T>;
}

export interface MetaState {
  isFetching: boolean;
  errors?: GQtyError[];
}

export interface UseMetaState {
  <T extends object>(opts?: UseMetaStateOptions<T>): MetaState;
}

export function createUseMetaState() {
  const useMetaState: UseMetaState = ({
    onStartFetching,
    onDoneFetching,
    onError,
    onRetry,
    filterSelections,
  } = {}) => {
    const targetSelections = useExtractedSelections(filterSelections);

    const [promises] = React.useState(() => new Set<Promise<unknown>>());
    const [errors] = React.useState(() => new Set<GQtyError>());
    const render = useRerender();

    React.useEffect(() => {
      return useMetaStateHack.subscribeFetch(({ promise, selections }) => {
        if (targetSelections.size > 0) {
          for (const selection of targetSelections) {
            if (selections.has(selection)) return;
          }
        }

        promises.add(promise);

        if (promises.size === 0) {
          errors.clear();
          onStartFetching?.();
          render();
        }

        promise
          .catch((error) => {
            const newError = GQtyError.create(error);
            errors.add(newError);
            onError?.({
              newError,
              selections: [...selections],
              isLastTry: true,
            });
          })
          .finally(() => {
            promises.delete(promise);

            if (promises.size === 0) {
              onDoneFetching?.();
              render();
            }
          });
      });
    }, []);

    React.useEffect(() => {
      return useMetaStateHack.subscribeRetry(({ promise, selections }) => {
        if (targetSelections.size > 0) {
          for (const selection of targetSelections) {
            if (selections.has(selection)) return;
          }
        }

        onRetry?.({
          retryPromise: promise,
          selections,
        });
      });
    }, []);

    return Object.freeze({
      isFetching: promises.size > 0,
      errors: [...errors],
    });
  };

  return useMetaState;
}
