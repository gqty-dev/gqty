import type { BaseGeneratedSchema } from '..';
import { GQtyError } from '../../Error';
import type { Selection } from '../../Selection';
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
  TSchema extends BaseGeneratedSchema = BaseGeneratedSchema,
>({
  cache,
  context: globalContext,
  resolvers: { createResolver },
  subscribeLegacySelections,
}: CreateLegacyMethodOptions<TSchema>) => {
  const track: LegacyTrack = (
    fn,
    { onError, operationName, refetch = false } = {}
  ) => {
    const trackedSelections = new Set<Selection>();
    const { context, selections, subscribe } = createResolver({
      cachePolicy: refetch ? 'no-cache' : 'default',
      operationName,
    });
    const resolutionCache = refetch ? context.cache : cache;
    const dataFn = (info: LegacyTrackCallInfo) => {
      globalContext.cache = resolutionCache;

      try {
        return fn(info);
      } finally {
        globalContext.cache = cache;
      }
    };
    const unsubscribe = subscribeLegacySelections((selection, cache) => {
      context.select(selection, cache);
    });
    const data = { current: dataFn({ type: 'initial' }) };

    for (const selection of selections) {
      trackedSelections.add(selection);
    }

    context.subscribeSelect((selection) => {
      trackedSelections.add(selection);
    });

    unsubscribe();

    const stop = subscribe({
      onError(error) {
        const theError = GQtyError.create(error);

        if (onError) {
          onError(theError);
        } else {
          throw theError;
        }
      },
      onNext() {
        data.current = dataFn({ type: 'cache_change' });
      },
    });

    return { data, selections: trackedSelections, stop };
  };

  return track;
};
