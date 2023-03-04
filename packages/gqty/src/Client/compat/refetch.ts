import type { BaseGeneratedSchema } from '..';
import { $meta } from '../../Accessor';
import type { Selection } from '../../Selection';
import { fetchSelections } from '../resolveSelections';
import { updateCaches } from '../updateCaches';
import type { CreateLegacyMethodOptions } from './client';
import type { LegacyInlineResolved } from './inlineResolved';

export type LegacyRefetch<TSchema extends BaseGeneratedSchema> = {
  <TData>(fn: (schema: TSchema) => TData): Promise<TData>;
  <TData>(accessor: TData): Promise<TData>;
};

export const createRefetch = <TSchema extends BaseGeneratedSchema>({
  cache,
  fetchOptions,
  inlineResolved,
  selectionHistory,
}: CreateLegacyMethodOptions<TSchema> & {
  /** Valid scalar selections for refetching. */
  selectionHistory: Set<Selection>;
  inlineResolved: LegacyInlineResolved;
}): LegacyRefetch<TSchema> => {
  return async <TData>(
    fnOrProxy: TData | ((schema: TSchema) => TData),
    operationName?: string
  ): Promise<TData> => {
    if (typeof fnOrProxy === 'function') {
      return inlineResolved(fnOrProxy as any, { refetch: true });
    } else {
      const selection = $meta(fnOrProxy as any)?.selection;
      if (!selection) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[gqty] Invalid proxy to refetch!');
        }

        return fnOrProxy;
      }

      const selections = new Set<Selection>();

      for (const leaf of selection.getLeafNodes()) {
        if (selectionHistory.has(leaf)) {
          selections.add(leaf);
        }
      }

      if (selections.size > 0) {
        await fetchSelections(selections, {
          cache,
          fetchOptions,
          operationName,
        }).then((results) => {
          updateCaches(results, [cache]);
        });
      }

      return fnOrProxy;
    }
  };
};
