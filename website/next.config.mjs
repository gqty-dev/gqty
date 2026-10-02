import nextra from 'nextra';
import { remarkMermaid } from 'remark-mermaid-nextra';

/**
 * Static export served from a GitHub Pages project site
 * (`https://gqty-dev.github.io/gqty/`).
 *
 * The `basePath` is also recorded in `NEXT_PUBLIC_BASE_PATH` so
 * `pages/_document.tsx` can emit the prefix rule used for Markdown-authored
 * links, which Nextra 2 writes as absolute paths and does not prefix itself.
 */
const basePath = '/gqty';

/**
 * @type {import("nextra").NextraConfig}
 */
const nextraConfig = {
  latex: true,
  mdxOptions: {
    remarkPlugins: [remarkMermaid],
  },
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
};

const withNextra = nextra(nextraConfig);

/** @type {import("next").NextConfig} */
const nextConfig = {
  output: 'export',
  basePath,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

/**
 * `pnpm dev` runs without `NEXTRA_STATIC_EXPORT` so the dev server keeps
 * serving from the root while production builds keep the `/gqty` prefix.
 */
const isStaticExport = Boolean(process.env.NEXTRA_STATIC_EXPORT);

const config = isStaticExport
  ? nextConfig
  : {
      ...nextConfig,
      output: undefined,
      basePath: undefined,
      env: {},
    };

export default withNextra(config);
