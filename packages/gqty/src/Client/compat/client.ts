import {
  type BaseGeneratedSchema,
  type FetchOptions,
  type SchemaContext,
} from '../..';
import { type Cache } from '../../Cache';
import { type ScalarsEnumsHash, type Schema } from '../../Schema';
import { type Selectable } from '../../Selectable';
import { type Selection } from '../../Selection';
import { type createDebugger } from '../debugger';
import { type Resolvers } from '../resolvers';
import {
  createLegacyHydrateCache,
  type LegacyHydrateCache,
} from './hydrateCache';
import {
  createLegacyInlineResolved,
  type LegacyInlineResolved,
} from './inlineResolved';
import { createLegacyMutate, type LegacyMutate } from './mutate';
import { createLegacyPrefetch, type LegacyPrefetch } from './prefetch';
import {
  createLegacyPrepareRender,
  type LegacyPrepareRender,
} from './prepareRender';
import { type LegacyQueryFetcher } from './queryFetcher';
import { createRefetch, type LegacyRefetch } from './refetch';
import { createLegacyResolved, type LegacyResolved } from './resolved';
import { type LegacySubscriptionsClient } from './subscriptionsClient';
import { createLegacyTrack, type LegacyTrack } from './track';

export {
  type LegacyHydrateCache,
  type LegacyHydrateCacheOptions,
} from './hydrateCache';
export {
  type LegacyInlineResolveOptions,
  type LegacyInlineResolved,
} from './inlineResolved';
export { type LegacyMutate, type LegacyMutateHelpers } from './mutate';
export { type LegacyPrefetch } from './prefetch';
export { type LegacyQueryFetcher } from './queryFetcher';
export { type LegacyRefetch } from './refetch';
export { type LegacyResolveOptions, type LegacyResolved } from './resolved';
export { type LegacySelection } from './selection';
export {
  type LegacySubscribeEvents,
  type LegacySubscriptionsClient,
} from './subscriptionsClient';
export {
  type LegacyTrack,
  type LegacyTrackCallInfo,
  type LegacyTrackCallType,
  type LegacyTrackOptions,
} from './track';

export type CreateLegacyClientOptions<TSchema extends BaseGeneratedSchema> = {
  accessor: TSchema;
  cache: Cache;
  context: SchemaContext;
  debugger: ReturnType<typeof createDebugger>;
  fetchOptions: FetchOptions;
  resolvers: Resolvers<TSchema>;
  scalars: ScalarsEnumsHash;
  schema: Readonly<Schema>;
  __depthLimit?: number;
};

export type LegacyClientOptions = {
  queryFetcher?: LegacyQueryFetcher;
  scalarsEnumsHash?: ScalarsEnumsHash;
  subscriptionsClient?: LegacySubscriptionsClient;
};

/**
 * Subscribing to selections made by global accessors, exposed for testing
 * purpose.
 */
export type SelectionSubscriber = (fn: Selectable['select']) => () => void;

export type LegacyClient<TSchema extends BaseGeneratedSchema> = {
  /**
   * @deprecated Use the new `resolve()` method.
   */
  resolved: LegacyResolved;
  /**
   * @deprecated Use the new `resolve()` method.
   */
  inlineResolved: LegacyInlineResolved;
  /**
   * @deprecated Use the new `resolve()` method.
   */
  mutate: LegacyMutate<TSchema>;
  /**
   * @deprecated Use the new `subscribe()` method.
   */
  track: LegacyTrack;
  /**
   * @deprecated Use the new `resolve()` method.
   */
  prefetch: LegacyPrefetch<TSchema>;
  /**
   * @deprecated Use the new `resolve()` method.
   */
  refetch: LegacyRefetch<TSchema>;
  /**
   * Captures selections made with a fake render, fetches them and returns the
   * result.
   */
  prepareRender: LegacyPrepareRender;
  /**
   * @deprecated The new cache hydration has no `shouldRefetch` option. It
   * always skip `no-cache` and `no-store` queries, and refetches according
   * to cache expiry.
   */
  // TODO: Make sure caches do not trigger immediate refetches.
  hydrateCache: LegacyHydrateCache;
  /**
   * @deprecated Please migrate from global accessors to locally scoped
   * accessors, i.e. `resolve({ query } => {})` or
   * `subscribe({ query } => {})`.
   */
  query: TSchema['query'];
  /**
   * @deprecated Please migrate from global accessors to locally scoped
   * accessors, i.e. `resolve({ mutation } => {})` or
   * `subscribe({ mutation } => {})`.
   */
  mutation: TSchema['mutation'];
  /**
   * @deprecated Please migrate from global accessors to locally scoped
   * accessors, i.e. `resolve({ subscription } => {})` or
   * `subscribe({ subscription } => {})`.
   */
  subscription: TSchema['subscription'];
  /** Exposed for testing purpose. */
  subscribeLegacySelections: SelectionSubscriber;
};

export type CreateLegacyMethodOptions<TSchema extends BaseGeneratedSchema> =
  CreateLegacyClientOptions<TSchema> & {
    subscribeLegacySelections: SelectionSubscriber;
  };

export const createLegacyClient = <TSchema extends BaseGeneratedSchema>(
  options: CreateLegacyClientOptions<TSchema>
): LegacyClient<TSchema> => {
  // Storing ALL scalar selections ever made, specifically made for refetch().
  const selectionHistory = new Set<Selection>();

  options.context.subscribeSelect((select) => {
    selectionHistory.add(select);
  });

  const methodOptions: CreateLegacyMethodOptions<TSchema> = {
    ...options,
    subscribeLegacySelections(fn) {
      const { context } = options;
      const unsubscribeSelect = context.subscribeSelect(fn);
      const unsubscribeDispose = context.subscribeDispose(unsubscribeSelect);

      return () => {
        unsubscribeDispose();
        unsubscribeSelect();
      };
    },
  };

  // `refetch` needs `inlineResolved`
  const inlineResolved = createLegacyInlineResolved<TSchema>(methodOptions);

  return {
    query: options.accessor.query,
    mutation: options.accessor.mutation,
    subscription: options.accessor.subscription,
    resolved: createLegacyResolved<TSchema>(methodOptions),
    inlineResolved,
    mutate: createLegacyMutate<TSchema>(methodOptions),
    track: createLegacyTrack<TSchema>(methodOptions),
    prefetch: createLegacyPrefetch(methodOptions),
    refetch: createRefetch({
      ...methodOptions,
      selectionHistory,
      inlineResolved,
    }),
    prepareRender: createLegacyPrepareRender(methodOptions),
    hydrateCache: createLegacyHydrateCache(methodOptions),

    subscribeLegacySelections: methodOptions.subscribeLegacySelections,
  };
};
