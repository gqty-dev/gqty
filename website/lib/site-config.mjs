/**
 * The single source of truth for where the site is *published* and where it is
 * currently *served from*.
 *
 * Serving location and published identity are deliberately different concerns:
 *
 *   - Production is GitHub Pages at `https://gqty-dev.github.io/gqty/`, with a
 *     `/gqty` serving base. Canonical and `og:url` metadata name it.
 *   - Cloudflare Pages previews render the same route namespace from an origin
 *     root (`/`) on a temporary `*.pages.dev` hostname. They are a duplicate
 *     rendering, never the published location, so canonical metadata still
 *     names GitHub Pages and the preview is marked non-indexable.
 *
 * `CANONICAL_*` are therefore immutable: they do not vary with the build
 * target. Only `BASE_PATH` (how this build's links and assets are prefixed)
 * depends on `WEBSITE_BUILD_TARGET`.
 *
 * Nothing here reads a secret. The only environment input is
 * `WEBSITE_BUILD_TARGET`, plus `CF_PAGES_URL` — which is a public deployment
 * hostname Cloudflare injects at build time and which is used only for
 * presence/diagnostics validation, never for canonical URLs.
 */

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  CANONICAL_ROOT,
  GITHUB_PAGES_BASE_PATH,
  PRODUCTION_BASE_PATH,
  PRODUCTION_ORIGIN,
  siteUrl as canonicalSiteUrl,
} from './canonical.mjs';

/**
 * The published identity lives in `canonical.mjs`, which is importable from
 * client-rendered code. This module adds the Node-only build plumbing: target
 * resolution, and the absolute path of `website/`.
 *
 * `siteUrl` is re-exported below so Node callers need one import.
 */
export {
  CANONICAL_ROOT,
  GITHUB_PAGES_BASE_PATH,
  PRODUCTION_BASE_PATH,
  PRODUCTION_ORIGIN,
};

export const GITHUB_PAGES_TARGET = 'github-pages';
export const CLOUDFLARE_PREVIEW_TARGET = 'cloudflare-preview';

export const BUILD_TARGET_ENV = 'WEBSITE_BUILD_TARGET';
export const PREVIEW_ORIGIN_ENV = 'CF_PAGES_URL';

/**
 * The Cloudflare-Pages-only `_headers` file. It is never uploaded to GitHub
 * Pages, and its presence in a default export is a defect.
 */
export const HEADERS_FILENAME = '_headers';

/** Absolute path of `website/`, for scripts that need it without Next. */
const here = dirname(fileURLToPath(import.meta.url));
export const SITE_ROOT = dirname(here);

/**
 * Build targets. `basePath` is what Next, `asset()`, and the export validator
 * prefix from; `preview` is the single boolean rendered metadata needs.
 */
export const BUILD_TARGETS = Object.freeze({
  [GITHUB_PAGES_TARGET]: Object.freeze({
    target: GITHUB_PAGES_TARGET,
    basePath: PRODUCTION_BASE_PATH,
    preview: false,
    requiresPreviewOrigin: false,
  }),
  [CLOUDFLARE_PREVIEW_TARGET]: Object.freeze({
    target: CLOUDFLARE_PREVIEW_TARGET,
    basePath: '',
    preview: true,
    requiresPreviewOrigin: true,
  }),
});

/**
 * Resolves the build target from the environment.
 *
 * An unset or empty `WEBSITE_BUILD_TARGET` means GitHub Pages, so every
 * existing build path keeps behaving exactly as it did before this file
 * existed. Any other value is rejected rather than silently falling back: a
 * typo in CI would otherwise publish preview markup, or production markup, to
 * the wrong host.
 *
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {{ target: string, basePath: string, preview: boolean, requiresPreviewOrigin: boolean, previewOrigin?: string }}
 */
export function resolveBuildTarget(env = process.env) {
  const raw = env[BUILD_TARGET_ENV];
  const requested =
    raw === undefined || raw.trim() === '' ? GITHUB_PAGES_TARGET : raw.trim();
  const config = BUILD_TARGETS[requested];

  if (!config) {
    throw new Error(
      `Unsupported ${BUILD_TARGET_ENV}: "${raw}". Expected "${GITHUB_PAGES_TARGET}" or "${CLOUDFLARE_PREVIEW_TARGET}".`
    );
  }

  if (!config.requiresPreviewOrigin) {
    return { ...config };
  }

  const origin = env[PREVIEW_ORIGIN_ENV];
  if (!origin || origin.trim() === '') {
    throw new Error(
      `${CLOUDFLARE_PREVIEW_TARGET} builds require ${PREVIEW_ORIGIN_ENV}. Cloudflare Pages injects it; provide it explicitly for local builds.`
    );
  }

  let parsed;
  try {
    parsed = new URL(origin.trim());
  } catch {
    throw new Error(
      `${PREVIEW_ORIGIN_ENV} is not a valid URL ("${origin}"). It must be an absolute HTTPS deployment URL such as https://<deployment>.pages.dev`
    );
  }

  if (parsed.protocol !== 'https:') {
    throw new Error(
      `${PREVIEW_ORIGIN_ENV} must be HTTPS ("${origin}"); the preview origin is never canonical and must never be reachable over plain HTTP.`
    );
  }

  return { ...config, previewOrigin: parsed.origin };
}

/**
 * Re-exported so Node callers have one import. Client-rendered theme code
 * imports `canonical.mjs` directly, because this module imports `node:path`
 * and `node:url` and therefore cannot be bundled for the browser.
 */
export const siteUrl = canonicalSiteUrl;
