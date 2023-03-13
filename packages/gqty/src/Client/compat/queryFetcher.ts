import type { ExecutionResult } from 'graphql';

export type LegacyQueryFetcher<TData = Record<string, unknown>> = (
  query: string,
  variables: Record<string, unknown>,
  fetchOptions?: Omit<RequestInit, 'body' | 'mode'>
) => Promise<ExecutionResult<TData>> | ExecutionResult;
