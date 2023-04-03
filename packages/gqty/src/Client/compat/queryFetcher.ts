import type { ExecutionResult } from 'graphql';
import type { QueryFetcher } from '../../Schema';

export type LegacyQueryFetcher<TData = Record<string, unknown>> = (
  query: string,
  variables: Record<string, unknown>,
  fetchOptions?: Omit<RequestInit, 'body' | 'mode'>
) => Promise<ExecutionResult<TData>> | ExecutionResult<TData>;

export const createLegacyQueryFetcher =
  <TData extends Record<string, unknown> = Record<string, unknown>>(
    queryFetcher: LegacyQueryFetcher<TData>
  ): QueryFetcher<TData> =>
  async ({ query, variables = {} }, fetchOptions) =>
    queryFetcher(query, variables, fetchOptions);
