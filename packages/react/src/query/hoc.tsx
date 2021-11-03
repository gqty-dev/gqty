import type { GQtyClient } from 'gqty';
import * as React from 'react';
import { OnErrorHandler, useInterceptSelections } from '../common';
import type { ReactClientOptionsWithDefaults } from '../utils';

export interface GraphQLHOCOptions {
  suspense?:
    | boolean
    | {
        fallback: React.SuspenseProps['fallback'];
      };
  staleWhileRevalidate?: boolean;
  onError?: OnErrorHandler;
}

export interface GraphQLHOC {
  <P>(
    component: (props: P) => React.ReactElement | null,
    options?: GraphQLHOCOptions
  ): (props: P) => React.ReactElement | null;
}

export function createGraphqlHOC(
  { scheduler, eventHandler, interceptorManager }: GQtyClient<any>,
  {
    defaults: {
      suspense: defaultSuspense,
      staleWhileRevalidate: defaultStaleWhileRevalidate,
    },
  }: ReactClientOptionsWithDefaults
) {
  const graphql: GraphQLHOC = function graphql<P>(
    component: ((props: P) => React.ReactElement | null) & {
      displayName?: string;
    },
    {
      suspense = defaultSuspense,
      staleWhileRevalidate = defaultStaleWhileRevalidate,
      onError,
    }: GraphQLHOCOptions = {}
  ) {
    const withGraphQL: {
      (props: P): React.ReactElement | null;
      displayName: string;
    } = function WithGraphQL(props): React.ReactElement | null {
      const { fetchingPromise, unsubscribe } = useInterceptSelections({
        interceptorManager,
        eventHandler,
        scheduler,
        staleWhileRevalidate,
        onError,
      });

      let returnValue: React.ReactElement | null = null;
      try {
        returnValue = component(props) ?? null;
      } finally {
        unsubscribe();
      }

      if (suspense && fetchingPromise.current) {
        function Suspend() {
          if (!fetchingPromise.current) return null;

          throw fetchingPromise.current;
        }
        const value = (
          <>
            {returnValue}
            <Suspend />
          </>
        );
        if (typeof suspense === 'object') {
          return React.createElement(React.Suspense, {
            fallback: suspense.fallback,
            children: value,
          });
        }
        return value;
      }
      return returnValue;
    };
    withGraphQL.displayName = `GraphQLComponent(${
      component?.displayName || component?.name || 'Anonymous'
    })${Date.now}`;

    return withGraphQL;
  };

  return graphql;
}
