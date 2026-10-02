/**
 * The published site identity, in one place, importable from both Node build
 * scripts and client-rendered theme code.
 *
 * These values are constants on purpose. The site is published only on GitHub
 * Pages at `https://gqty-dev.github.io/gqty/`; a Cloudflare Pages preview
 * renders the same route namespace from a temporary origin, which is a
 * duplicate rendering rather than a second publication. Canonical and
 * `og:url` therefore name GitHub Pages in every build target.
 *
 * Nothing here reads the environment. The serving base — which *does* vary by
 * target — lives in `site-config.mjs`, together with the Node-only build
 * plumbing that must not reach the browser bundle.
 */

/** The only origin this site is published on. */
export const PRODUCTION_ORIGIN = 'https://gqty-dev.github.io';

/** The serving (and canonical) base path of the production site. */
export const PRODUCTION_BASE_PATH = '/gqty';

/** The GitHub Pages serving base, named for the target that uses it. */
export const GITHUB_PAGES_BASE_PATH = PRODUCTION_BASE_PATH;

/** Canonical namespace for every published route. Target-independent. */
export const CANONICAL_ROOT = `${PRODUCTION_ORIGIN}${PRODUCTION_BASE_PATH}`;

/**
 * Builds an absolute URL on the published GitHub Pages origin from a
 * site-relative path.
 *
 * @param {string} path
 */
export function siteUrl(path) {
  const normalized = path.startsWith('/') ? path : `/${path}`;

  return normalized === '/'
    ? `${CANONICAL_ROOT}/`
    : `${CANONICAL_ROOT}${normalized}`;
}
