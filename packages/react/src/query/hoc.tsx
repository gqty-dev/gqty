import { useRerender } from '../hooks';
import type { BaseGeneratedSchema, GQtyClient } from 'gqty';
import * as React from 'react';
import type { OnErrorHandler } from '../common';
import type { ReactClientOptionsWithDefaults } from '../utils';

export interface GraphQLHOCOptions {
  onError?: OnErrorHandler;
  operationName?: string;
  staleWhileRevalidate?: boolean;
  suspense?: boolean | { fallback: React.SuspenseProps['fallback'] };
}

export interface GraphQLHOC {
  <P>(
    component: (props: P) => React.ReactElement | null,
    options?: GraphQLHOCOptions
  ): (props: P) => React.ReactElement | null;
}

export function createGraphqlHOC<TSchema extends BaseGeneratedSchema>(
  { createResolver, subscribeLegacySelections }: GQtyClient<TSchema>,
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
      staleWhileRevalidate,
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
      } = createResolver({ operationName, retryPolicy: retry });
      const unsubscribe = subscribeLegacySelections((selection, cache) => {
        context.select(selection, cache);
      });
      const render = useRerender();
      React.useEffect(render, [staleWhileRevalidate]);

      let elm: React.ReactElement | null = null;
      try {
        elm = component({ ...props, query, mutation, subscription });
      } finally {
        unsubscribe();
      }

      if (!context.shouldFetch) {
        return elm;
      }

      const promise = resolve().finally(render);

      if (onError) {
        promise.catch(onError);
      }

      if (suspense === true) {
        throw promise;
      } else if (typeof suspense === 'object') {
        const Suspender: React.FunctionComponent = () => {
          if (!promise) return null;

          throw promise;
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
    })${Date.now()}`;

    return withGraphQL;
  };

  return graphql;
}
