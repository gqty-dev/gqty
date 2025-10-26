import {
  type BaseGeneratedSchema,
  type GQtyClient,
  type LegacyHydrateCacheOptions,
} from 'gqty';
import { type ReactNode, useEffect, useMemo } from 'react';
import type { ReactClientOptionsWithDefaults } from '../utils';

export interface UseHydrateCacheOptions
  extends Partial<LegacyHydrateCacheOptions> {
  /**
   * Cache snapshot, returned from `prepareReactRender`
   */
  cacheSnapshot: string | undefined;
  /**
   * If it should refetch everything after the component is mounted
   *
   * @default
   * false
   */
  shouldRefetch?: boolean;
}

/**
 * Props with `cacheSnapshot` that would be returned from `prepareReactRender`
 */
export type PropsWithServerCache<
  T extends Record<string | number, unknown> = Record<string | number, unknown>,
> = {
  /**
   * Cache snapshot, returned from `prepareReactRender`
   */
  cacheSnapshot?: string;
} & T;

export interface UseHydrateCache {
  ({ cacheSnapshot, shouldRefetch }: UseHydrateCacheOptions): void;
}

export interface PrepareReactRender {
  (element: ReactNode): Promise<{
    cacheSnapshot: string;
  }>;
}

const IS_SERVER = false;
let hasWarnedAboutSSR = false;

export function createSSRHelpers<TSchema extends BaseGeneratedSchema>(
  { hydrateCache, prepareRender, query, refetch }: GQtyClient<TSchema>,
  { defaults: { refetchAfterHydrate } }: ReactClientOptionsWithDefaults
) {
  const prepareReactRender: PrepareReactRender =
    async function prepareReactRenderRN(_element: ReactNode) {
      if (!hasWarnedAboutSSR && process.env.NODE_ENV !== 'production') {
        hasWarnedAboutSSR = true;
        console.warn(
          '[GQty] prepareReactRender is not supported on React Native environments.'
        );
      }

      return prepareRender(async () => {});
    };

  const useHydrateCache: UseHydrateCache = function useHydrateCache({
    cacheSnapshot,
    shouldRefetch = refetchAfterHydrate,
  }: UseHydrateCacheOptions) {
    useMemo(() => {
      if (!IS_SERVER && cacheSnapshot) {
        hydrateCache({ cacheSnapshot, shouldRefetch: false });
      }
    }, [cacheSnapshot]);

    useEffect(() => {
      if (!IS_SERVER && shouldRefetch) {
        refetch(query).catch(console.error);
      }
    }, [shouldRefetch]);
  };

  return {
    useHydrateCache,
    prepareReactRender,
  };
}
