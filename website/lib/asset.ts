/**
 * The site is exported to a GitHub Pages project path, so its public files live
 * under a sub-path instead of the origin root.
 *
 * Next prefixes its own bundles and route links from `basePath`, but it does
 * not rewrite paths passed to `next/image` when image optimization is disabled
 * (which static export requires). `asset()` centralizes the prefix so authors
 * keep writing root-relative paths.
 *
 * Statically imported image modules (for example `import logo from "./logo.svg"`)
 * resolve to a `StaticImageData` object rather than a string, so those values are
 * passed through unchanged.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

type StaticImageLike = { src: string };

function isStaticImage(value: unknown): value is StaticImageLike {
  return typeof value === 'object' && value !== null && 'src' in value;
}

export function asset<T>(source: T): T | string {
  // Statically imported images are already emitted under the built asset path
  // (`<basePath>/_next/static/media/...`), so they must not be prefixed again.
  if (isStaticImage(source)) {
    return source;
  }

  if (typeof source !== 'string' || !source.startsWith('/')) {
    return source;
  }

  if (BASE_PATH !== '' && source.startsWith(`${BASE_PATH}/`)) {
    return source;
  }

  return `${BASE_PATH}${source}`;
}

/**
 * Builds an absolute URL on the published site origin from a site-relative
 * path, for canonical and Open Graph metadata.
 */
export const SITE_ORIGIN = 'https://gqty-dev.github.io';
export const SITE_PATH = '/gqty';

export function siteUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;

  return normalized === '/'
    ? `${SITE_ORIGIN}${SITE_PATH}/`
    : `${SITE_ORIGIN}${SITE_PATH}${normalized}`;
}
