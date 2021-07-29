module.exports = {
  title: 'gqty',
  tagline: `A GraphQL client without queries`,
  url: 'https://gqty.dev',
  baseUrl: '/',
  favicon: '/favicon.ico',
  organizationName: 'gqty',
  projectName: 'gqty',
  themeConfig: {
    sidebarCollapsible: true,
    colorMode: {
      respectPrefersColorScheme: true,
    },
    prism: {
      theme:
        //@ts-ignore
        require('prism-react-renderer/themes/nightOwlLight'),
      darkTheme:
        //@ts-ignore
        require('prism-react-renderer/themes/shadesOfPurple'),
    },
    algolia: {
      apiKey: 'c00e78ccfa93ead531ad80e4dd94b48b',
      indexName: 'gqty',
      algoliaOptions: {},
    },
    navbar: {
      title: null,
      logo: {
        alt: 'gqty Logo',
        src: '/img/logo-sm.svg',
      },
      items: [
        {
          label: 'Discord',
          to: 'https://discord.gg/FjwyGQKYER',
          position: 'right',
        },
        {
          label: 'Introduction',
          to: 'intro',
          position: 'right',
          activeBasePath: 'intro',
        },
        {
          label: 'Get started',
          to: 'getting-started',
          position: 'right',
        },
        {
          label: 'Examples',
          to: '/examples',
          position: 'right',
          activeBasePath: 'examples',
        },
        {
          label: 'React',
          to: 'react/fetching-data',
          position: 'right',
          activeBasePath: 'react',
        },

        // { to: 'blog', label: 'Blog', position: 'left' },
        {
          href: 'https://github.com/PabloSzx/gqty',
          position: 'right',
          dangerouslySetInnerHTML: {
            __html: `
              <img
                class="github-star"
                alt="GitHub"
                src="https://img.shields.io/github/stars/gqty/gqty?style=social&label=Star"
              />
            `,
          },
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Introduction',
              to: 'intro',
            },
            {
              label: 'Getting Started',
              to: 'getting-started',
            },
            {
              label: 'React',
              to: 'react/fetching-data',
              position: 'right',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Twitter',
              href: 'http://twitter.com/gqtydev',
            },
            {
              label: 'Discussions',
              href: 'https://github.com/PabloSzx/gqty/discussions',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/PabloSzx/gqty',
            },
            {
              label: 'Open Collective',
              href: 'https://opencollective.com/gqty',
            },
          ],
        },
      ],
      copyright: `
<div>
  <p>${`© Copyright ${new Date().getFullYear()} GQty`}</p>
</div>
      `.trim(),
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          path: '../../docs',
          sidebarPath: require.resolve('./sidebars.js'),
          routeBasePath: '/',
          editUrl: 'https://github.com/PabloSzx/gqty/edit/master/docs/master',
          remarkPlugins: [require('./src/plugins/remark-yarn2npm')],
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
        },
        theme: {
          customCss: require.resolve('./src/style.css'),
        },
      },
    ],
  ],
  stylesheets: ['/fonts.css'],
  onBrokenLinks: 'warn',
};
