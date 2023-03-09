import type { GQtyClient } from 'gqty';
import * as React from 'react';
import type { OnErrorHandler } from '../common';
import type { ReactClientOptionsWithDefaults } from '../utils';

export interface GraphQLHOCOptions {
  suspense?: boolean | { fallback: React.SuspenseProps['fallback'] };
  staleWhileRevalidate?: boolean;
  onError?: OnErrorHandler;
  operationName?: string;
}

export interface GraphQLHOC {
  <P>(
    component: (props: P) => React.ReactElement | null,
    options?: GraphQLHOCOptions
  ): (props: P) => React.ReactElement | null;
}

export function createGraphqlHOC(
  { createResolver, subscribeLegacySelections }: GQtyClient<any>,
  {
    defaults: { suspense: defaultSuspense, retry },
  }: ReactClientOptionsWithDefaults
) {
  const graphql: GraphQLHOC = function graphql<P>(
    component: ((props: P) => React.ReactElement | null) & {
      displayName?: string;
    },
    {
      onError,
      operationName,
      suspense = defaultSuspense,
    }: GraphQLHOCOptions = {}
  ) {
    const withGraphQL: {
      (props: P): React.ReactElement | null;
      displayName: string;
    } = function WithGraphQL(props): React.ReactElement | null {
      const {
        accessor: { query, mutation, subscription },
        context,
        resolve,
      } = createResolver({
        operationName,
        retryPolicy: retry,
      });
      const unsubscribe = subscribeLegacySelections((selection, cache) => {
        context.onSelect?.(selection, cache);
      });
      const fetchPromise = React.useRef<Promise<any>>();

      let elm: React.ReactElement | null = null;
      try {
        elm = component({ ...props, query, mutation, subscription });
      } finally {
        unsubscribe();
      }

      if (!context.shouldFetch) {
        return elm;
      }

      fetchPromise.current = resolve();

      if (onError) {
        fetchPromise.current.catch(onError);
      }

      if (suspense === true) {
        throw fetchPromise.current;
      } else if (typeof suspense === 'object') {
        const Suspender: React.FunctionComponent = () => {
          if (!fetchPromise.current) return null;

          throw fetchPromise.current;
        };

        return (
          <React.Suspense fallback={suspense.fallback}>
            <Suspender />
            {elm}
          </React.Suspense>
        );
      }

      return elm;
    };

    withGraphQL.displayName = `GraphQLComponent(${
      component?.displayName || component?.name || 'Anonymous'
    })${Date.now}`;

    return withGraphQL;
  };

  return graphql;
}
