import type {
  BaseGeneratedSchema,
  GQtyClient,
  LegacyHydrateCacheOptions,
} from 'gqty';
import { useEffect, type ReactNode } from 'react';
import { getDefault, ReactClientOptionsWithDefaults } from '../utils';

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
  T extends Record<string | number, unknown> = Record<string | number, unknown>
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

export function createSSRHelpers<TSchema extends BaseGeneratedSchema>(
  { hydrateCache, prepareRender, query, refetch }: GQtyClient<TSchema>,
  { defaults: { refetchAfterHydrate } }: ReactClientOptionsWithDefaults
) {
  const prepareReactRender: PrepareReactRender =
    async function prepareReactRender(element: ReactNode) {
      const ssrPrepass = getDefault(await import('react-ssr-prepass'));

      return prepareRender(() => ssrPrepass(element));
    };
  const useHydrateCache: UseHydrateCache = function useHydrateCache({
    cacheSnapshot,
    shouldRefetch = refetchAfterHydrate,
  }: UseHydrateCacheOptions) {
    useEffect(() => {
      if (cacheSnapshot) {
        hydrateCache({ cacheSnapshot, shouldRefetch: false });
      }
    }, []);
    useEffect(() => {
      if (shouldRefetch) {
        refetch(query).catch(console.error);
      }
    }, [shouldRefetch]);
  };

  return {
    useHydrateCache,
    prepareReactRender,
  };
}
