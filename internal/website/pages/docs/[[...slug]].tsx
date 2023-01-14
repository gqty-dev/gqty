import Head from 'next/head';

import { DocsContent, DocsTOC, MDXPage } from '@guild-docs/client';
import { MDXPaths, MDXProps } from '@guild-docs/server';

import { getRoutes } from '../../routes';

import type { GetStaticPaths, GetStaticProps } from 'next';

export default MDXPage(
  function PostPage({ content, TOC, MetaHead, BottomNavigation }) {
    return (
      <>
        <Head>{MetaHead}</Head>
        <DocsContent>{content}</DocsContent>
        <DocsTOC>
          <TOC />
          <BottomNavigation />
        </DocsTOC>
      </>
    );
  },
  {
    renderTitle(title) {
      if (!title) return 'GQty';
      return `${title} - GQty`;
    },
    giscus: {
      repo: 'gqty-dev/gqty',
      repoId: 'MDEwOlJlcG9zaXRvcnkzNzU4MjIxOTM=',
      category: 'Q&A',
      categoryId: 'DIC_kwDOFmaXcc4B-nRb',
    },
  },
);

export const getStaticProps: GetStaticProps = (ctx) => {
  return MDXProps(
    ({ readMarkdownFile, getArrayParam }) => {
      return readMarkdownFile('docs/', getArrayParam('slug'));
    },
    ctx,
    {
      getRoutes,
    },
  );
};

export const getStaticPaths: GetStaticPaths = (ctx) => {
  return MDXPaths('docs', { ctx });
};
