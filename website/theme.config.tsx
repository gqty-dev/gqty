import Image from 'next/image';
import { useRouter } from 'next/router';
import { type DocsThemeConfig } from 'nextra-theme-docs';
import PronounciationButton from './components/theme/PronounciationButton';
import { asset } from './lib/asset';

const SITE_URL = 'https://gqty-dev.github.io/gqty';
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
    // published URL is built explicitly from the canonical site origin.
    const path = asPath.replace(/\/index$/, '/');
    const url = path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`;

    return {
      titleTemplate: asPath === '/' ? 'GQty' : '%s - GQty',
      description: DESCRIPTION,
      canonical: url,
      openGraph: {
        url,
        type: 'website',
        siteName: 'GQty',
      },
    };
  },
};

export default config;
