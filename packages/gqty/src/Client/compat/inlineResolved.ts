import type { BaseGeneratedSchema } from '../..';
import type { CreateLegacyMethodOptions } from './client';
import { convertSelection, LegacySelection } from './selection';

export interface LegacyInlineResolved {
  <TData = unknown>(
    fn: () => TData,
    options?: LegacyInlineResolveOptions<TData>
  ): TData | Promise<TData>;
}

export interface LegacyInlineResolveOptions<TData> {
  refetch?: boolean;
  onEmptyResolve?: () => void;
  /**
   * Get every selection intercepted in the specified function
   */
  onSelection?: (selection: LegacySelection) => void;
  /**
   * On valid cache data found callback
   */
  onCacheData?: (data: TData) => void;
  /**
   * Query operation name
   */
  operationName?: string;
}

export const createLegacyInlineResolved = <
  TSchema extends BaseGeneratedSchema = BaseGeneratedSchema
>({
  resolvers: { createResolver },
  subscribeLegacySelections,
}: CreateLegacyMethodOptions<TSchema>): LegacyInlineResolved => {
  return (
    fn,
    {
      refetch = false,
      onEmptyResolve,
      onSelection,
      onCacheData,
      operationName,
    } = {}
  ) => {
    const { context, selections, resolve } = createResolver({
      cachePolicy: refetch ? 'no-cache' : 'default',
      operationName,
    });
    const unsubscribe = subscribeLegacySelections((selection, cache) => {
      context.select(selection, cache);
      onSelection?.(convertSelection(selection));
    });

    context.shouldFetch ||= refetch;

    const data = fn();

    unsubscribe();

    if (selections.size === 0) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[gqty] Warning! No data requested.');
      }
      onEmptyResolve?.();
      return data;
    }

    if (!context.shouldFetch) {
      return data;
    }

    if (context.hasCacheHit && !refetch) {
      onCacheData?.(data);
    }

    return resolve().then(() => fn());
  };
};
