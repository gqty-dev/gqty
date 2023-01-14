require('bob-tsm');

const { i18n } = require('./next-i18next.config');

const { withGuildDocs } = require('@guild-docs/server');

const { getRoutes } = require('./routes.ts');

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(
  withGuildDocs({
    i18n,
    getRoutes,
    experimental: {
      esmExternals: false,
    },
    images: {
      remotePatterns: [
        {
          hostname: 'avatars.githubusercontent.com',
          pathname: '/u/**',
        },
      ],
    },
    async redirects() {
      return [
        {
          source: '/docs',
          destination: '/docs/getting-started',
          permanent: true,
        },
      ];
    },
  }),
);
