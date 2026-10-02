import Image from 'next/image';
import { useRouter } from 'next/router';
import { type DocsThemeConfig } from 'nextra-theme-docs';
import PronounciationButton from './components/theme/PronounciationButton';
import { IS_PREVIEW, asset } from './lib/asset';
import { CANONICAL_ROOT } from './lib/canonical.mjs';

/**
 * The published site identity. Constant in every build target: a Cloudflare
 * Pages preview is a temporary duplicate rendering of these same routes, so
 * canonical and `og:url` keep naming GitHub Pages there too.
 */
const SITE_URL = CANONICAL_ROOT;
const REPOSITORY_URL = 'https://github.com/gqty-dev/gqty';
const DESCRIPTION = 'A No-GraphQL Client for TypeScript';

const config: DocsThemeConfig = {
  primaryHue: { dark: 318, light: 318 },
  logo: (
    <span className="site-logo">
      <Image
        src={asset('/logo/gqty.svg')}
        alt="GQty Logo"
        width={86}
        height={45}
        priority
      />
      <PronounciationButton />
    </span>
  ),
  project: {
    link: REPOSITORY_URL,
  },
  chat: {
    link: 'https://discord.gg/Y5zSsGsPZB',
  },
  darkMode: false,
  nextThemes: {
    defaultTheme: 'dark',
  },
  docsRepositoryBase: `${REPOSITORY_URL}/tree/main/website`,
  /**
   * Replaces Nextra's default `head`, which injects the theme's own
   * description, `twitter:site`, `apple-mobile-web-app-title`, and duplicate
   * `og:title`/`og:description` tags. `useNextSeoProps` already emits the page
   * metadata through `next-seo`, so only the favicon is added here.
   */
  head: (
    <>
      <link rel="icon" href={asset('/favicon.ico')} sizes="any" />
    </>
  ),
  footer: {
    text: (
      <span>
        MIT {new Date().getFullYear()} &copy; <a href={SITE_URL}>{SITE_URL}</a>.
      </span>
    ),
  },
  useNextSeoProps: () => {
    const { asPath } = useRouter();

    // Nextra 2 does not prefix `openGraph.url` from `basePath`, so the
    // published URL is built explicitly from the canonical site origin. On a
    // preview build `asPath` is root-relative, which is what this expression
    // expects: SITE_URL supplies the `/gqty` prefix.
    const path = asPath.replace(/\/index$/, '/');
    const url = path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`;

    /**
     * A Cloudflare Pages preview is public but must never be indexed: it
     * duplicates the production route namespace on a temporary hostname.
     *
     * These two flags make `next-seo` emit one `noindex,nofollow` directive
     * in place of its default `index,follow`, so a preview page carries
     * exactly one robots tag. The preview's `out/_headers` states the same
     * policy as an HTTP header; `check:export` asserts both.
     */
    const robots = IS_PREVIEW ? { noindex: true, nofollow: true } : {};

    return {
      titleTemplate: asPath === '/' ? 'GQty' : '%s - GQty',
      description: DESCRIPTION,
      canonical: url,
      ...robots,
      openGraph: {
        url,
        type: 'website',
        siteName: 'GQty',
      },
    };
  },
};

export default config;
