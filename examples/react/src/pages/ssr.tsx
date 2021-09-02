import { PropsWithServerCache } from '@gqty/react';

import {
  graphql,
  prepareReactRender,
  useHydrateCache,
} from '../components/client';
import { default as RefetchPage } from './refetch';

import type { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps<PropsWithServerCache> =
  async ({}) => {
    const { cacheSnapshot } = await prepareReactRender(
      <>
        <RefetchPage />
      </>
    );

    return {
      props: {
        cacheSnapshot,
      },
    };
  };

export default graphql(
  function SSRPage({ cacheSnapshot }: PropsWithServerCache) {
    useHydrateCache({
      cacheSnapshot,
    });

    return <RefetchPage />;
  },
  {
    suspense: {
      fallback: 'Loading SSR...',
    },
    staleWhileRevalidate: false,
  }
);
