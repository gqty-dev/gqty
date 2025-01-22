import {
  type BaseGeneratedSchema,
  type GQtyClient,
  type LegacyHydrateCacheOptions,
} from 'gqty';
import { type ReactNode, useEffect, useMemo } from 'react';
import { version } from 'react-dom/server';
import { getDefault, type ReactClientOptionsWithDefaults } from '../utils';

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

const IS_SERVER = typeof window === 'undefined';

export function createSSRHelpers<TSchema extends BaseGeneratedSchema>(
  { hydrateCache, prepareRender, query, refetch }: GQtyClient<TSchema>,
  { defaults: { refetchAfterHydrate } }: ReactClientOptionsWithDefaults
) {
  const prepareReactRender: PrepareReactRender =
    async function prepareReactRender(element: ReactNode) {
      const majorVersion = +version.split('.')[0];

      if (majorVersion >= 18) {
        const { renderToPipeableStream, renderToReadableStream } = await import(
          'react-dom/server'
        );

        if (renderToReadableStream !== undefined) {
          return prepareRender(async () => {
            const stream = await renderToReadableStream(element);

            await stream.allReady;
          });
        } else {
          return prepareRender(
            () =>
              new Promise((resolve, reject) => {
                renderToPipeableStream(element, {
                  onAllReady: resolve,
                  onError: reject,
                });
              })
          );
        }
      } else {
        const ssrPrepass = getDefault(await import('react-ssr-prepass'));

        return prepareRender(() => ssrPrepass(element));
      }
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
