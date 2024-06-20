import { fromJSON } from 'flatted';
import type { BaseGeneratedSchema } from '..';
import { $meta } from '../../Accessor';
import { GQtyError } from '../../Error';
import type { Selection } from '../../Selection';
import { fetchSelections } from '../resolveSelections';
import { updateCaches } from '../updateCaches';
import type { CreateLegacyMethodOptions } from './client';
import { isLegacyCacheSnapshot } from './prepareRender';

export type LegacyHydrateCache = {
  ({ cacheSnapshot, shouldRefetch }: LegacyHydrateCacheOptions): void;
};

export type LegacyHydrateCacheOptions = {
  /**
   * Cache snapshot, returned from `prepareRender`
   */
  cacheSnapshot: string;
  /**
   * If it should refetch everything after
   *
   * Specify a number greater than `0` to delay the refetch that amount in ms
   *
   * @default
   * false
   */
  shouldRefetch?: boolean | number;
};

export const createLegacyHydrateCache =
  <TSchema extends BaseGeneratedSchema>({
    accessor,
    cache,
    fetchOptions,
  }: CreateLegacyMethodOptions<TSchema>): LegacyHydrateCache =>
  ({ cacheSnapshot, shouldRefetch = false }) => {
    const { cache: snapshot, selections: selectionSnapshots } =
      parseSnapshot(cacheSnapshot);

    if (snapshot) {
      cache.restore(snapshot);
    }

    if (selectionSnapshots && shouldRefetch) {
      const selections = new Set<Selection>();
      for (const [[root], ...snapshot] of selectionSnapshots) {
        const { selection } = $meta(
          accessor[root as keyof BaseGeneratedSchema]!
        )!;

        selections.add(selection.fromJSON(snapshot));
      }

      setTimeout(
        () => {
          fetchSelections(selections, {
            cache,
            fetchOptions: {
              ...fetchOptions,
              cachePolicy: 'no-cache', // refetch
            },
          }).then((results) => updateCaches(results, [cache]));
        },
        shouldRefetch === true ? 0 : shouldRefetch
      );
    }
  };

// [ ] New SSR should always trust the cache during hydration, never refetch
// until cache expiry or SWR.

export const parseSnapshot = (snapshot: string) => {
  try {
    const data = fromJSON(snapshot);
    if (!isLegacyCacheSnapshot(data)) {
      throw 1;
    }

    return data;
  } catch {
    throw new GQtyError(`Unrecognized snapshot format.`);
  }
};
