import type { BaseGeneratedSchema } from '../..';
import type { Selection } from '../../Selection';
import { fetchSelections } from '../resolveSelections';
import { updateCaches } from '../updateCaches';
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
  cache,
  debugger: debug,
  fetchOptions: { fetchPolicy, ...fetchOptions },
  subscribeLegacySelections: subscribeSelections,
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
    let hasCacheHit = false;
    let shouldFetch = refetch;
    const selections = new Set<Selection>();
    const unsubscribe = subscribeSelections((selection, cache) => {
      shouldFetch ||= cache?.data === undefined;
      hasCacheHit ||= cache?.data !== undefined;

      selections.add(selection);
      onSelection?.(convertSelection(selection));
    });

    const data = fn();

    unsubscribe();

    if (selections.size === 0) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[gqty] Warning! No data requested.');
      }
      onEmptyResolve?.();
      return data;
    }

    if (!shouldFetch) {
      return data;
    }

    if (hasCacheHit && !refetch) {
      onCacheData?.(data);
    }

    return fetchSelections(selections, {
      debugger: debug,
      fetchOptions,
      operationName,
    })
      .then((results) => updateCaches(results, [cache]))
      .then(() => fn())
      .finally(() => {
        selections.clear();
      });
  };
};
