import type { BaseGeneratedSchema } from '..';
import { assignSelections, setCache } from '../../Accessor';
import { GQtyError } from '../../Error';
import type { CreateLegacyMethodOptions } from './client';

export interface LegacyMutateHelpers<TSchema extends BaseGeneratedSchema> {
  query: TSchema['query'];
  setCache: typeof setCache;
  assignSelections: typeof assignSelections;
}

export interface LegacyMutate<TSchema extends BaseGeneratedSchema> {
  <T = any>(
    fn: (mutation: TSchema['mutation']) => T,
    opts?: {
      onComplete?: (data: T, helpers: LegacyMutateHelpers<TSchema>) => void;
      onError?: (
        error: GQtyError,
        helpers: LegacyMutateHelpers<TSchema>
      ) => void;
    }
  ): Promise<T>;
}

export const createLegacyMutate =
  <TSchema extends BaseGeneratedSchema>({
    accessor,
    resolvers: { resolve },
  }: CreateLegacyMethodOptions<TSchema>): LegacyMutate<TSchema> =>
  async (fn, { onComplete, onError } = {}) => {
    try {
      const data = (await resolve(({ mutation }) => fn(mutation), {
        cachePolicy: 'no-cache',
      })) as ReturnType<typeof fn>;

      onComplete?.(data, {
        query: accessor.query,
        setCache,
        assignSelections,
      });

      return data;
    } catch (e) {
      if (e instanceof GQtyError) {
        onError?.(e, {
          query: accessor.query,
          setCache,
          assignSelections,
        });
      }

      throw e;
    }
  };
