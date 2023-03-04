import { GraphQLError } from 'graphql';
import type { BaseGeneratedSchema } from '..';
import { Cache } from '../../Cache';
import { GQtyError } from '../../Error';
import type { Selection } from '../../Selection';
import { subscribeSelections } from '../resolveSelections';
import { updateCaches } from '../updateCaches';
import type { CreateLegacyMethodOptions } from './client';

export type LegacyTrackCallType = 'initial' | 'cache_change';

export interface LegacyTrackCallInfo {
  type: LegacyTrackCallType;
}

export interface LegacyTrackOptions {
  onError?: ((err: GQtyError) => void) | undefined;

  operationName?: string;

  /** Refetch on initial call */
  refetch?: boolean;
}

export interface LegacyTrack {
  <TData>(
    callback: (info: LegacyTrackCallInfo) => TData,
    options?: LegacyTrackOptions
  ): {
    stop: () => void;
    selections: Set<Selection>;
    data: { current: TData | undefined };
  };
}

export const createLegacyTrack = <
  TSchema extends BaseGeneratedSchema = BaseGeneratedSchema
>({
  cache,
  context,
  fetchOptions: { fetchPolicy, ...fetchOptions },
  subscribeLegacySelections,
}: CreateLegacyMethodOptions<TSchema>) => {
  const track: LegacyTrack = (
    fn,
    { onError, operationName, refetch = false } = {}
  ) => {
    const selections = new Set<Selection>();
    const resolutionCache = refetch ? new Cache() : cache;
    const dataFn = (info: LegacyTrackCallInfo) => {
      context.cache = resolutionCache;

      const data = fn(info);

      context.cache = cache;

      return data;
    };

    const unsubscribe = subscribeLegacySelections((selection) => {
      selections.add(selection);
    });

    const data = { current: dataFn({ type: 'initial' }) };

    unsubscribe();

    const unsubscribeCache = context.cache.subscribe(
      [...selections].map(({ cacheKeys }) => cacheKeys.join('.')),
      () => {
        data.current = fn({ type: 'cache_change' });
      }
    );

    const unsubscribeSelections = subscribeSelections(
      selections,
      ({ errors, data, extensions }) => {
        if (errors) {
          const error = errors.every((error) => error instanceof GraphQLError)
            ? GQtyError.fromGraphQLErrors(errors)
            : errors[0] instanceof GQtyError
            ? errors[0]
            : new GQtyError('Subscription thrown an unknown error.', {
                otherError: errors[0],
              });

          if (onError) {
            onError(error);
          } else {
            throw error;
          }
        } else if (data !== undefined) {
          updateCaches(
            [{ data, extensions }],
            fetchPolicy !== 'no-store' && context.cache !== cache
              ? [context.cache, cache]
              : [context.cache],
            { skipNotify: !context.notifyCacheUpdate }
          );
        } else {
          // Fetches responded, subscriptions closed, but cache subscription is
          // still active.
        }
      },
      {
        fetchOptions: {
          fetchPolicy: refetch ? 'no-cache' : fetchPolicy,
          ...fetchOptions,
        },
        operationName,
      }
    );

    return {
      data,
      selections,
      stop: () => {
        unsubscribeCache();
        unsubscribeSelections();
      },
    };
  };

  return track;
};
