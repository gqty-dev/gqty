import {
  useDocumentVisibility,
  useIntervalEffect,
  useUpdateEffect,
} from '@react-hookz/web';
import type { BaseGeneratedSchema, GQtyError, RetryOptions } from 'gqty';
import type { LegacyFetchPolicy, OnErrorHandler } from '../common';
import type { ReactClientOptionsWithDefaults } from '../utils';
import type { UseQuery } from './useQuery';

export interface UseTransactionQueryState<TData> {
  data: TData | undefined;
  error?: GQtyError;
  isCalled: boolean;
  promise?: Promise<TData>;
}

export type UseTransactionQueryOptions<TData, TVariables> = {
  fetchPolicy?: LegacyFetchPolicy;
  skip?: boolean;
  /**
   * Frequency in milliseconds of polling/refetch of the query
   */
  pollInterval?: number;
  /**
   * If it should do polling while on background
   *
   * @default false
   */
  pollInBackground?: boolean;
  notifyOnNetworkStatusChange?: boolean;
  variables?: TVariables;
  onCompleted?: (data: TData) => void;
  onError?: OnErrorHandler;
  retry?: RetryOptions;
  suspense?: boolean;
  operationName?: string;
};

export interface UseTransactionQuery<TSchema extends BaseGeneratedSchema> {
  <TData, TVariables = undefined>(
    fn: (query: TSchema['query'], variables?: TVariables) => TData,
    queryOptions?: UseTransactionQueryOptions<TData, TVariables>
  ): UseTransactionQueryState<TData>;
}

export function createUseTransactionQuery<TSchema extends BaseGeneratedSchema>(
  useQuery: UseQuery<TSchema>,
  {
    defaults: {
      transactionFetchPolicy: defaultFetchPolicy,
      retry: defaultRetry,
      transactionQuerySuspense: defaultSuspense,
    },
  }: ReactClientOptionsWithDefaults
) {
  const useTransactionQuery: UseTransactionQuery<TSchema> = (
    fn,
    {
      fetchPolicy = defaultFetchPolicy,
      notifyOnNetworkStatusChange = true,
      onCompleted,
      onError,
      operationName,
      pollInBackground = false,
      pollInterval,
      retry = defaultRetry,
      skip = false,
      suspense = defaultSuspense,
      variables,
    } = {}
  ) => {
    const query = useQuery({
      fetchPolicy,
      notifyOnNetworkStatusChange,
      operationName,
      prepare: ({ query }) => (skip ? undefined : fn(query, variables)),
      retry,
      suspense,
    });

    useUpdateEffect(() => {
      if (!query.$state.isLoading) {
        onCompleted?.(fn(query, variables));
      }
    }, [query.$state.isLoading]);

    useUpdateEffect(() => {
      if (query.$state.error) {
        onError?.(query.$state.error);
      }
    }, [query.$state.error]);

    const visible = useDocumentVisibility();

    useIntervalEffect(() => {
      if (skip || query.$state.isLoading || (!visible && !pollInBackground))
        return;

      query.$refetch();
    }, pollInterval);

    return skip
      ? { data: undefined, isCalled: false }
      : { data: fn(query, variables), isCalled: true };
  };

  return useTransactionQuery;
}
