import nextra from 'nextra';
import { remarkMermaid } from 'remark-mermaid-nextra';
import { resolveBuildTarget } from './lib/site-config.mjs';

/**
 * The serving base comes from the explicit build target, never from an
 * implicit assumption about the host.
 *
 *   - unset / `github-pages`: `/gqty`, matching the production project site
 *     (`https://gqty-dev.github.io/gqty/`).
 *   - `cloudflare-preview`: `''`, because a Cloudflare Pages preview serves
 *     the same routes from its origin root.
 *   - anything else: the build fails here rather than publishing markup that
 *     points at the wrong paths.
 *
 * `basePath` is declared once. Next prefixes its own bundles and route links
 * from it, Nextra routes Markdown links through `next/link`, which prefixes
 * them too, and `NEXT_PUBLIC_BASE_PATH` lets `asset()` prefix the
 * `next/image` sources that `images.unoptimized` leaves untouched.
 *
 * Canonical URLs are a separate concern: they always name
 * `https://gqty-dev.github.io/gqty/`, in both targets. See `lib/site-config.mjs`.
 */
const target = resolveBuildTarget();

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
  basePath: target.basePath,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: target.basePath,
    // Only the rendered metadata needs to know this, and only as a boolean:
    // the preview hostname is never exposed to the client bundle.
    NEXT_PUBLIC_PREVIEW: target.preview ? 'true' : '',
  },
};

/**
 * `pnpm dev` runs without `NEXTRA_STATIC_EXPORT` so the dev server keeps
 * serving from the root while production builds keep the target's prefix.
 * A preview target is root-served anyway, so this only affects GitHub Pages.
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
