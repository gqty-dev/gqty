import type { BaseGeneratedSchema, FetchOptions, SchemaContext } from '../..';
import type { Cache } from '../../Cache';
import type { ScalarsEnumsHash, Schema } from '../../Schema';
import type { Selection } from '../../Selection';
import type { createDebugger } from '../debugger';
import type { Resolvers } from '../resolvers';
import { createLegacyHydrateCache, LegacyHydrateCache } from './hydrateCache';
import {
  createLegacyInlineResolved,
  LegacyInlineResolved,
} from './inlineResolved';
import { createLegacyMutate, LegacyMutate } from './mutate';
import { createLegacyPrefetch, LegacyPrefetch } from './prefetch';
import {
  createLegacyPrepareRender,
  LegacyPrepareRender,
} from './prepareRender';
import type { LegacyQueryFetcher } from './queryFetcher';
import { createRefetch, LegacyRefetch } from './refetch';
import { createLegacyResolved, LegacyResolved } from './resolved';
import type { LegacySubscriptionsClient } from './subscriptionsClient';
import { createLegacyTrack, LegacyTrack } from './track';

export type {
  LegacyHydrateCache,
  LegacyHydrateCacheOptions,
} from './hydrateCache';
export type {
  LegacyInlineResolved,
  LegacyInlineResolveOptions,
} from './inlineResolved';
export type { LegacyMutate, LegacyMutateHelpers } from './mutate';
export type { LegacyPrefetch } from './prefetch';
export type { LegacyQueryFetcher } from './queryFetcher';
export type { LegacyRefetch } from './refetch';
export type { LegacyResolved, LegacyResolveOptions } from './resolved';
export type { LegacySelection } from './selection';
export type {
  LegacySubscribeEvents,
  LegacySubscriptionsClient,
} from './subscriptionsClient';
export type {
  LegacyTrack,
  LegacyTrackCallInfo,
  LegacyTrackCallType,
  LegacyTrackOptions,
} from './track';

let deprecationWarningMessage: string | undefined =
  !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
    ? '[GQty] global query, mutation and subscription is deprecated, use ' +
      '`schema` instead.'
    : undefined;

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
export type SelectionSubscriber = (
  fn: NonNullable<SchemaContext['onSelect']>
) => () => void;

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
   * @deprecated It does not include selections from scoped queries such as
   * `resolve()` and `subscribe()`, do not mix usage if you are using SSR.
   */
  prepareRender: LegacyPrepareRender;
  /**
   * @deprecated The new cache hydration has no `shouldRefetch` option. It
   * always skip `no-cache` and `no-store` queries, and refetches according
   * to cache expiry.
   */
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

  /** compat: Selection callback for global accessors */
  const selectionSubscriptions = new Set<
    NonNullable<SchemaContext['onSelect']>
  >();

  const prevOnSelect = options.context.onSelect;
  options.context.onSelect = (selection, cache) => {
    if (selectionSubscriptions.size > 0) {
      selectionHistory.add(selection);
    }

    selectionSubscriptions.forEach((fn) => fn(selection, cache));

    prevOnSelect?.call(options.context, selection, cache);
  };

  const methodOptions: CreateLegacyMethodOptions<TSchema> = {
    ...options,
    subscribeLegacySelections(fn) {
      selectionSubscriptions.add(fn);
      return () => selectionSubscriptions.delete(fn);
    },
  };

  // `refetch` needs `inlineResolved`
  const inlineResolved = createLegacyInlineResolved<TSchema>(methodOptions);

  return {
    get query() {
      deprecationWarningMessage && console.warn(deprecationWarningMessage);
      deprecationWarningMessage = undefined;

      return options.accessor.query;
    },
    get mutation() {
      deprecationWarningMessage && console.warn(deprecationWarningMessage);
      deprecationWarningMessage = undefined;

      return options.accessor.mutation;
    },
    get subscription() {
      deprecationWarningMessage && console.warn(deprecationWarningMessage);
      deprecationWarningMessage = undefined;

      return options.accessor.subscription;
    },

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