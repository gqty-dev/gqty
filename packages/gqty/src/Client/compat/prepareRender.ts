import { toJSON } from 'flatted';
import type { BaseGeneratedSchema } from '..';
import { Cache } from '../../Cache';
import type { CacheSnapshot } from '../../Cache/persistence';
import type { Selection, SelectionSnapshot } from '../../Selection';
import { isPlainObject } from '../../Utils';
import { fetchSelections } from '../resolveSelections';
import { updateCaches } from '../updateCaches';
import type { CreateLegacyMethodOptions } from './client';

export interface LegacyPrepareRender {
  (render: () => Promise<void> | void): Promise<{
    cacheSnapshot: string;
  }>;
}

export type LegacyCacheSnapshot = {
  cache?: CacheSnapshot;
  selections?: SelectionSnapshot[];
};

export const isLegacyCacheSnapshot = (
  json: unknown
): json is LegacyCacheSnapshot => {
  if (json != null && !isPlainObject(json)) {
    return false;
  }

  const snapshot = json as LegacyCacheSnapshot;

  if (snapshot.cache !== undefined && !isPlainObject(snapshot.cache)) {
    return false;
  }

  if (snapshot.selections) {
    if (!Array.isArray(snapshot.selections)) {
      return false;
    }

    if (
      !snapshot.selections.every((selection) => {
        if (
          !Array.isArray(selection) ||
          !selection.every((it) => {
            if (!Array.isArray(it)) return false;

            if (typeof it[0] !== 'string' && typeof it[0] !== 'number')
              return false;

            if (
              it[1] &&
              (!isPlainObject(it[1]) ||
                !isPlainObject(it[1].input) ||
                (it[1].isUnion !== undefined && it[1].isUnion !== true))
            )
              return false;

            return true;
          })
        )
          return false;

        return true;
      })
    )
      return false;
  }

  return true;
};

export const createLegacyPrepareRender = <TSchema extends BaseGeneratedSchema>({
  cache,
  debugger: debug,
  fetchOptions,
  subscribeLegacySelections,
}: CreateLegacyMethodOptions<TSchema>): LegacyPrepareRender => {
  return async (render) => {
    const ssrCache = new Cache();
    const selections = new Set<Selection>();

    // This works even for the new scoped hooks because there is a hack at
    // SchemaContext.parentContext which sends selections upwards to the context
    // at client level. Which should be removed in the future when a proper way
    // to chain selection callbacks is implemented.
    const unsubscribe = subscribeLegacySelections((selection) => {
      selections.add(selection);
    });

    try {
      await render();
    } finally {
      unsubscribe();
    }

    // We can simply fetch here because subscriptions are be skipped on
    // server side. Deferred fetches such as useLazyQuery and useMutation
    // also don't fire during SSR.
    await fetchSelections(
      new Set([...selections].filter((s) => s.root.key !== 'subscription')),
      {
        cache,
        debugger: debug,
        fetchOptions,
      }
    ).then((results) =>
      updateCaches(results, [cache, ssrCache], { skipNotify: true })
    );

    return {
      cacheSnapshot: toJSON(
        Object.keys(cache.toJSON()).length > 0
          ? selections.size > 0
            ? { cache, selections: [...selections] }
            : { cache }
          : {}
      ),
    };
  };
};
