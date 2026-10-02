import nextra from 'nextra';
import { remarkMermaid } from 'remark-mermaid-nextra';

/**
 * Static export served from a GitHub Pages project site
 * (`https://gqty-dev.github.io/gqty/`).
 *
 * `basePath` is declared once here. Next prefixes its own bundles and route
 * links from it, Nextra routes Markdown links through `next/link`, which
 * prefixes them too, and `NEXT_PUBLIC_BASE_PATH` lets `asset()` prefix the
 * `next/image` sources that `images.unoptimized` leaves untouched.
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
