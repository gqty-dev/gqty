#!/usr/bin/env node
/**
 * Deterministic validation of the exported static site.
 *
 * The checks read `out/` (produced by `pnpm build`) and fail on:
 *   - missing expected routes
 *   - internal references that escape the serving base
 *   - local references that do not resolve to a file in the export
 *   - markdown fragment links whose target heading does not exist
 *   - per-page metadata that is missing, duplicated, or not the page's own URL
 *   - a robots directive that does not match the hosting mode
 *   - search-index routes that would resolve somewhere other than the export
 *   - preview `_headers` that are missing, malformed, or contaminating a
 *     production export
 *   - expired-domain, proprietary-CSS, or build-time-secret assumptions
 *   - paragraph elements nested inside a paragraph
 *   - responsive layout guards (see `check-layout.mjs`)
 *
 * The checks are hosting-aware. Two serving locations exist for the same
 * published route namespace: `/gqty` on GitHub Pages (production) and the
 * origin root on a Cloudflare Pages preview. Everything that is not a serving
 * prefix — the canonical namespace, the route set, the reference rules, the
 * metadata rules, the layout guards — is identical in both, so this file
 * exposes one factory, `createExportValidator(mode)`, rather than two
 * divergent validators.
 *
 * Nothing here executes the site or talks to the network.
 */

import { access, readFile, readdir } from 'node:fs/promises';
import { constants } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { checkLayout } from './check-layout.mjs';
import {
  CANONICAL_ROOT,
  CLOUDFLARE_PREVIEW_TARGET,
  GITHUB_PAGES_BASE_PATH,
  GITHUB_PAGES_TARGET,
  HEADERS_FILENAME,
  PRODUCTION_ORIGIN,
  SITE_ROOT,
  resolveBuildTarget,
  siteUrl,
} from '../lib/site-config.mjs';

export {
  CANONICAL_ROOT,
  CLOUDFLARE_PREVIEW_TARGET,
  GITHUB_PAGES_BASE_PATH,
  GITHUB_PAGES_TARGET,
  HEADERS_FILENAME,
} from '../lib/site-config.mjs';

const here = fileURLToPath(new URL('.', import.meta.url));
const siteRoot = SITE_ROOT;

/**
 * Serving bases a build can be validated in, keyed by build target.
 *
 * GitHub Pages keeps the production base and stays indexable. The Cloudflare
 * preview renders from the origin root and is the only mode that carries
 * `_headers`. Both validate against one canonical namespace.
 */
export const VALIDATION_MODES = Object.freeze({
  [GITHUB_PAGES_TARGET]: Object.freeze({
    target: GITHUB_PAGES_TARGET,
    basePath: GITHUB_PAGES_BASE_PATH,
    preview: false,
    previewOrigin: undefined,
  }),
  [CLOUDFLARE_PREVIEW_TARGET]: Object.freeze({
    target: CLOUDFLARE_PREVIEW_TARGET,
    basePath: '',
    preview: true,
    previewOrigin: undefined,
  }),
});

export { PRODUCTION_ORIGIN, siteUrl };

export const SITE_ORIGIN = PRODUCTION_ORIGIN;

/**
 * Resolves the validation mode for this process from the environment, through
 * the same build-target parser the site build uses. An unset target validates
 * the GitHub Pages export, exactly as before this file was hosting-aware.
 *
 * @param {NodeJS.ProcessEnv} [env]
 */
export function resolveValidationMode(env = process.env) {
  const resolved = resolveBuildTarget(env);
  return {
    ...VALIDATION_MODES[resolved.target],
    previewOrigin: resolved.previewOrigin,
  };
}

/** Required first line of a preview `_headers` file. */
export const HEADERS_MATCH_PATTERN = '/*';

/** Header every preview response must carry. */
export const PREVIEW_ROBOTS_HEADER = 'X-Robots-Tag: noindex, nofollow';

/**
 * Icon rule. The favicon lives in the serving base, so its path follows the
 * target while the canonical namespace never does.
 */
export function faviconPathFor(basePath) {
  return `${basePath}/favicon.ico`;
}

export const ROUTES = [
  '/',
  '/404.html',
  '/getting-started/',
  '/concepts/',
  '/guides/react/read/',
  '/guides/react/write/',
  '/guides/react/cache/',
  '/guides/react/subs/',
  '/guides/core/resolve/',
  '/guides/core/subscribe/',
  '/guides/next/rsc/',
  '/guides/next/ssr-ssg/',
  '/api-reference/cli/',
  '/api-reference/configuration/',
  '/api-reference/core/resolve/',
  '/api-reference/core/subscribe/',
  '/api-reference/react/use-query/',
  '/api-reference/react/use-transaction-query/',
  '/api-reference/react/use-lazy-query/',
  '/api-reference/react/use-paginated-query/',
  '/api-reference/react/use-mutation/',
  '/api-reference/react/use-subscription/',
];

/**
 * Exported pages that are framework-generated and carry no per-page metadata.
 *
 * Nextra only runs its head for routes that exist in the page map, so the
 * stock 404 exports (which `output: export` writes to both `404.html` and
 * `404/index.html`) have no `<head>` metadata at all. They are not content
 * pages and are excluded from the per-page metadata checks rather than
 * weakening those checks for real pages.
 */
/**
 * Routes exempt from per-page metadata and robots checks, expressed relative to
 * the serving base so both modes exempt the same files.
 */
export const METADATA_EXEMPT_ROUTE_SUFFIXES = [
  '/404.html',
  '/404/',
  '/500.html',
  '/500/',
];

/** Per-page metadata that must appear exactly once, per route. */
export const METADATA_FIELDS = [
  {
    label: 'description',
    pattern: /<meta name="description" content="([^"]*)"/g,
  },
  { label: 'canonical', pattern: /<link rel="canonical" href="([^"]*)"/g },
  {
    label: 'og:title',
    pattern: /<meta property="og:title" content="([^"]*)"/g,
  },
  {
    label: 'og:description',
    pattern: /<meta property="og:description" content="([^"]*)"/g,
  },
  { label: 'og:url', pattern: /<meta property="og:url" content="([^"]*)"/g },
];

/**
 * Strings that must not appear in build output. These are provenance or
 * licensing regressions, not legitimate documentation content.
 *
 * Documentation text that merely mentions GraphQL, SSR, `getStaticProps`, or
 * `useRouter` is content, not a runtime dependency, so those words are
 * deliberately absent from this list.
 */
export const FORBIDDEN_PATTERNS = [
  // Written as a join so that this file does not itself contain the expired
  // domain as a literal. The detector above still matches it in build output.
  { pattern: ['gqty', 'dev'].join('.'), reason: 'expired domain' },
  { pattern: 'GQty-Website', reason: 'archived source repository' },
  { pattern: 'GITHUB_PAT', reason: 'build-time secret' },
  { pattern: 'reshaped', reason: 'proprietary design system' },
  { pattern: '@vercel/', reason: 'Vercel telemetry package' },
  { pattern: 'vercel.com', reason: 'Vercel deployment host' },
];

/**
 * Hard-coded framework metadata that must not survive into the export.
 *
 * Nextra 2's docs theme injects these unless the theme config replaces its
 * default `head`. They are not provenance problems, but they are wrong
 * attribution and, in the case of `description`, they override the page's own
 * description.
 */
/** `robots` metadata: exactly one value per content page. */
export const ROBOTS_PATTERN = /<meta name="robots" content="([^"]*)"/g;

/** The directive each mode must publish. */
export function expectedRobots(preview) {
  return preview ? 'noindex,nofollow' : 'index,follow';
}

export const FORBIDDEN_ATTRIBUTION = [
  { pattern: '@shuding_', reason: 'Nextra theme author attribution' },
  {
    pattern: 'Nextra: the next docs builder',
    reason: 'Nextra theme default description',
  },
  {
    pattern: 'apple-mobile-web-app-title" content="Nextra',
    reason: 'Nextra theme default app title',
  },
];

/**
 * The framework emits one root-absolute reference of its own: a font
 * `preconnect` to `/`. It is not a navigable asset, so it is exempt from the
 * escape check. Every other root-absolute reference — including
 * `/favicon.ico`, which the theme emits base-prefixed — must stay under the
 * serving base.
 */
const ALLOWED_ROOT_REFERENCES = new Set(['/']);

/**
 * Reads an exported route relative to the serving base.
 *
 * The base is a target input, so it is passed in rather than imported as a
 * constant: the same function validates a `/gqty` export and a root export.
 */
export function routePathFor(basePath, route) {
  return `${basePath}${route}`;
}

export async function listFiles(dir) {
  /** @type {string[]} */
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...(await listFiles(full)));
    } else {
      found.push(full);
    }
  }
  return found;
}

/** Maps a site-absolute URL path onto a file inside the export directory. */
export function resolveExportPathFor(outDir, urlPath, basePath = '') {
  const withoutQuery = urlPath.split('#')[0].split('?')[0];
  if (!withoutQuery.startsWith(basePath)) return undefined;

  const sitePath = withoutQuery.slice(basePath.length);
  const relativePath =
    sitePath === '' || sitePath === '/' ? '/index.html' : sitePath;
  const candidates = relativePath.endsWith('/')
    ? [join(outDir, relativePath, 'index.html')]
    : [
        join(outDir, relativePath),
        join(outDir, `${relativePath}.html`),
        join(outDir, relativePath, 'index.html'),
      ];

  return candidates;
}

export function extractReferences(html) {
  /** @type {Array<{ attr: string, value: string }>} */
  const refs = [];

  for (const match of html.matchAll(/\s(href|src)="([^"]*)"/g)) {
    refs.push({ attr: match[1], value: match[2] });
  }

  for (const match of html.matchAll(/\ssrcset="([^"]*)"/g)) {
    for (const candidate of match[1].split(',')) {
      const url = candidate.trim().split(/\s+/)[0];
      if (url) refs.push({ attr: 'srcset', value: url });
    }
  }

  return refs;
}

export function extractCssUrls(css) {
  /** @type {string[]} */
  const urls = [];
  for (const match of css.matchAll(/url\((['"]?)([^'")]+)\1\)/g)) {
    urls.push(match[2]);
  }
  return urls;
}

/** Any attribute string beginning with `href="` and naming a fragment. */
export const FRAGMENT_HREF_PATTERN = /(?:href|src)="([^"]*#[^"]*)"/g;

/**
 * Extracts every in-site link that carries a `#fragment`.
 *
 * Returns `{ route, fragment }` pairs, where `route` is the site-absolute path
 * the fragment applies to (`'/gqty/concepts/'` for both `/gqty/concepts/#x`
 * and a bare `#x` on that page).
 */
export function extractFragmentLinks(html, pageRoute, basePath = '') {
  /** @type {Array<{ route: string, fragment: string }>} */
  const links = [];

  for (const match of html.matchAll(FRAGMENT_HREF_PATTERN)) {
    const value = match[1];
    if (value.startsWith('//')) continue;

    const [path, fragment] = value.split('#');
    if (!fragment) continue;

    if (path === '') {
      links.push({ route: pageRoute, fragment });
      continue;
    }

    if (!path.startsWith('/')) continue;
    const route =
      path === basePath || path === `${basePath}/`
        ? `${basePath}/`
        : path.endsWith('/')
          ? path
          : path;
    links.push({ route, fragment });
  }

  return links;
}

/**
 * Collects the element `id` values and heading anchor names a page exposes.
 *
 * Nextra renders markdown headings as `<a class="subheading-anchor" href="#x"
 * id="x">` anchors and list headings as `id="x"`, so ids alone cover both.
 */
export function extractAnchorIds(html) {
  const ids = new Set();
  for (const match of html.matchAll(/\sid="([^"]+)"/g)) {
    ids.add(match[1]);
  }
  return ids;
}

/**
 * Finds `<p>` elements opened inside another `<p>`.
 *
 * An explicit JSX `<p>` in MDX whose child text is written across lines is
 * re-parsed as Markdown, so the author's `<p>` ends up wrapping a framework
 * paragraph: `<p class="author"><p class="markdown">text</p></p>`. The
 * browser cannot represent that, so it repairs the tree while parsing, and
 * React fails hydration with a 418/423 mismatch because the server and client
 * markup disagree.
 *
 * `p` cannot nest in HTML at all, so any unclosed `<p>` start tag reached
 * while another `<p>` is open is a defect rather than a formatting choice.
 * The scan is a flat walk over start/end tags: HTML void elements
 * (`<img>`, `<br>`, `<hr>`, …) are ignored because a `<p>` after them is a
 * sibling, and only `<p>` open/close tags are tracked, so intervening markup
 * such as the `<a>` and `<h3>` of a route card does not end the enclosing run.
 *
 * @param {string} html raw exported markup
 * @returns {number} how many nested `<p>` elements were found
 */
export function countNestedParagraphs(html) {
  let depth = 0;
  let nested = 0;

  for (const match of html.matchAll(/<\/?p(?:\s|\/|>)/gi)) {
    if (match[0].startsWith('</')) {
      if (depth > 0) depth -= 1;
      continue;
    }
    if (depth > 0) nested += 1;
    depth += 1;
  }

  return nested;
}

/** Reads the route a page file belongs to, as used in canonical URLs. */
export function routeFromExportFileFor(rel, basePath = '') {
  const normalized = rel.replaceAll('\\', '/');
  if (normalized === 'index.html') return `${basePath}/`;
  if (normalized.endsWith('/index.html')) {
    return `${basePath}/${normalized.slice(0, -'index.html'.length)}`;
  }
  return `${basePath}/${normalized}`;
}

/** Reads every occurrence of a field's capture group. */
export function extractMetadataValues(html, pattern) {
  return [...html.matchAll(pattern)].map((match) => match[1]);
}

async function exists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function pathExistsAny(candidates) {
  for (const candidate of candidates) {
    if (await exists(candidate)) return true;
  }
  return false;
}

export function isInternalReference(value) {
  return (
    value.startsWith('/') && !value.startsWith('//') && !value.startsWith('#')
  );
}

export function checkInternalReferenceFor(value, basePath = '') {
  if (!isInternalReference(value)) return undefined;
  if (ALLOWED_ROOT_REFERENCES.has(value)) return undefined;
  if (basePath === '') return undefined;
  if (value.startsWith(`${basePath}/`) || value === basePath) return undefined;

  return `internal reference escapes ${basePath}: ${value}`;
}

/**
 * Validates the exported Nextra search index.
 *
 * The theme loads `nextra-data-<locale>.json` from
 * `<basePath>/_next/static/chunks/`, builds one result URL per index key, and
 * renders each result through `next/link`, which applies `basePath` itself.
 * A key therefore has to be unprefixed: a prefixed key resolves to
 * `/gqty/gqty/...` once the link is rendered.
 *
 * With an empty serving base the same rule holds, and the check is the only
 * thing standing between a key like `/gqty/concepts` and a result URL that
 * points at a path the export does not contain.
 *
 * @param {string} outDir
 * @param {string} [basePath]
 */
export async function checkSearchIndexFor(outDir, basePath = '') {
  const failures = [];
  const chunksDir = join(outDir, '_next', 'static', 'chunks');

  /**
   * The prefix a key must never carry.
   *
   * `next/link` adds the serving base to every search hit. On GitHub Pages a
   * key of `/gqty/concepts` renders as `/gqty/gqty/concepts`. On a preview the
   * serving base is empty, so the only prefix that can double up is a stale
   * GitHub Pages base carried over from the production index.
   */
  const forbiddenPrefix = basePath === '' ? GITHUB_PAGES_BASE_PATH : basePath;

  const entries = await readdir(chunksDir).catch(() => []);
  const indexFiles = entries.filter(
    (name) => name.startsWith('nextra-data-') && name.endsWith('.json')
  );

  if (indexFiles.length === 0) {
    failures.push('search index not found in the export');
    return failures;
  }

  for (const name of indexFiles) {
    const raw = await readFile(join(chunksDir, name), 'utf8').catch(() => '');

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      failures.push(`search index ${name} is not valid JSON`);
      continue;
    }

    const routes = Object.keys(data);
    if (routes.length === 0) {
      failures.push(`search index ${name} is empty`);
      continue;
    }

    for (const route of routes) {
      if (
        route === forbiddenPrefix ||
        route.startsWith(`${forbiddenPrefix}/`)
      ) {
        failures.push(
          `search index route is already base-prefixed and would double-prefix: ${route}`
        );
        continue;
      }

      if (!route.startsWith('/')) {
        failures.push(`search index route is not site-absolute: ${route}`);
        continue;
      }

      // This is the URL the theme builds, before `next/link` adds basePath.
      const themeUrl = `${basePath}${route}`;
      const candidates = resolveExportPathFor(outDir, themeUrl, basePath);
      if (!candidates || !(await pathExistsAny(candidates))) {
        failures.push(
          `search index route does not resolve after basePath: ${route} -> ${themeUrl}`
        );
      }
    }
  }

  return failures;
}

/**
 * Validates the preview-only `_headers` file.
 *
 * A preview must carry `X-Robots-Tag: noindex, nofollow` for `/*`, because
 * the deployment is a public duplicate rendering of the production route
 * namespace. A production export must not carry the file at all: stale local
 * output from a preview build would otherwise mark the live site
 * non-indexable, and `.nojekyll` plus artifact upload would ship it.
 *
 * @param {string} outDir
 * @param {{ preview: boolean, target: string }} mode
 */
export async function checkPreviewHeadersFor(outDir, mode) {
  const failures = [];
  const headersPath = join(outDir, HEADERS_FILENAME);
  const present = await exists(headersPath);

  if (!mode.preview) {
    if (present) {
      failures.push(
        `${HEADERS_FILENAME} must not be present in a ${mode.target} export; it carries preview-only indexing protection`
      );
    }
    return failures;
  }

  if (!present) {
    failures.push(
      `preview export is missing ${HEADERS_FILENAME} (expected "${HEADERS_MATCH_PATTERN}" with "${PREVIEW_ROBOTS_HEADER}")`
    );
    return failures;
  }

  const contents = await readFile(headersPath, 'utf8');

  if (
    !contents.split('\n').some((line) => line.trim() === HEADERS_MATCH_PATTERN)
  ) {
    failures.push(
      `${HEADERS_FILENAME} must target ${HEADERS_MATCH_PATTERN} so every response carries the preview indexing policy`
    );
  }

  if (!contents.includes(PREVIEW_ROBOTS_HEADER)) {
    failures.push(`${HEADERS_FILENAME} is missing "${PREVIEW_ROBOTS_HEADER}"`);
  }

  return failures;
}

/** Extracts every `robots` metadata value from a page. */
export function extractRobotsValues(html) {
  return extractMetadataValues(html, ROBOTS_PATTERN);
}

/**
 * Validates the `robots` directive on every content page.
 *
 * Each page must carry exactly one directive and it must match the hosting
 * mode: `index,follow` on GitHub Pages, `noindex,nofollow` on a preview.
 * Framework-generated 404/500 pages are exempt, as they are for the rest of
 * the per-page metadata.
 *
 * @param {string} outDir
 * @param {{ preview: boolean, basePath: string }} mode
 */
export async function checkRobotsFor(outDir, mode) {
  const failures = [];
  const expected = expectedRobots(mode.preview);
  const exempt = new Set(
    METADATA_EXEMPT_ROUTE_SUFFIXES.map((suffix) => `${mode.basePath}${suffix}`)
  );

  for (const file of await listFiles(outDir)) {
    if (!file.endsWith('.html')) continue;

    const rel = relative(outDir, file);
    const pageRoute = routeFromExportFileFor(rel, mode.basePath);
    if (exempt.has(pageRoute)) continue;

    const values = extractRobotsValues(await readFile(file, 'utf8'));
    if (values.length !== 1) {
      failures.push(
        `${rel}: expected exactly one robots directive, found ${values.length}`
      );
      continue;
    }

    if (values[0] !== expected) {
      failures.push(`${rel}: robots is ${values[0]}, expected ${expected}`);
    }
  }

  return failures;
}

/**
 * Runs every check against an export directory.
 *
 * @param {string} outDir
 * @param {string} [basePath] serving base of the export under test
 * @returns {Promise<string[]>} list of failures; empty means success
 */
export async function checkExportFor(outDir, basePath = '') {
  const failures = [];

  for (const route of ROUTES) {
    const candidates = resolveExportPathFor(
      outDir,
      routePathFor(basePath, route),
      basePath
    );
    if (!candidates || !(await pathExistsAny(candidates))) {
      failures.push(`missing expected route: ${basePath}${route}`);
    }
  }

  const files = await listFiles(outDir);

  /** Anchor ids per exported route, so fragment links can be validated. */
  const anchorIds = new Map();
  for (const file of files) {
    if (!file.endsWith('.html')) continue;
    const rel = relative(outDir, file);
    anchorIds.set(
      routeFromExportFileFor(rel, basePath),
      extractAnchorIds(await readFile(file, 'utf8'))
    );
  }

  const metadataExemptRoutes = new Set(
    METADATA_EXEMPT_ROUTE_SUFFIXES.map((suffix) => `${basePath}${suffix}`)
  );

  for (const file of files) {
    const rel = relative(outDir, file);

    if (file.endsWith('.html')) {
      const html = await readFile(file, 'utf8');

      for (const { value } of extractReferences(html)) {
        const problem = checkInternalReferenceFor(value, basePath);
        if (problem) {
          failures.push(`${rel}: ${problem}`);
          continue;
        }

        if (!isInternalReference(value)) continue;
        const candidates = resolveExportPathFor(outDir, value, basePath);
        if (candidates && !(await pathExistsAny(candidates))) {
          failures.push(`${rel}: local reference does not exist: ${value}`);
        }
      }

      const fragmentPageRoute = routeFromExportFileFor(rel, basePath);
      for (const { route, fragment } of extractFragmentLinks(
        html,
        fragmentPageRoute,
        basePath
      )) {
        if (!route.startsWith(`${basePath}/`)) continue;
        const ids = anchorIds.get(route);
        if (!ids) continue;
        if (!ids.has(decodeURIComponent(fragment))) {
          failures.push(
            `${rel}: fragment does not resolve: ${route}#${fragment}`
          );
        }
      }

      for (const { pattern, reason } of FORBIDDEN_PATTERNS) {
        if (html.includes(pattern)) {
          failures.push(`${rel}: contains ${reason} ("${pattern}")`);
        }
      }

      for (const { pattern, reason } of FORBIDDEN_ATTRIBUTION) {
        if (html.includes(pattern)) {
          failures.push(`${rel}: contains ${reason} ("${pattern}")`);
        }
      }

      const nestedParagraphs = countNestedParagraphs(html);
      if (nestedParagraphs > 0) {
        failures.push(
          `${rel}: contains ${nestedParagraphs} paragraph element(s) nested inside a paragraph; ` +
            'an explicit <p> in MDX whose text spans lines is re-parsed as Markdown'
        );
      }

      const pageRoute = routeFromExportFileFor(rel, basePath);
      const enforcesMetadata = !metadataExemptRoutes.has(pageRoute);

      for (const { label, pattern } of METADATA_FIELDS) {
        if (!enforcesMetadata) break;
        const values = extractMetadataValues(html, pattern);
        if (values.length !== 1) {
          failures.push(
            `${rel}: expected exactly one ${label}, found ${values.length}`
          );
        }
      }

      // The serving base is stripped before the canonical namespace is
      // applied, so a preview route canonicalizes to its GitHub Pages
      // equivalent rather than to the preview hostname.
      const expectedUrl = `${CANONICAL_ROOT}${pageRoute.slice(basePath.length)}`;

      const canonical = extractMetadataValues(
        html,
        /<link rel="canonical" href="([^"]*)"/g
      );
      if (
        enforcesMetadata &&
        canonical.length === 1 &&
        canonical[0] !== expectedUrl
      ) {
        failures.push(
          `${rel}: canonical is ${canonical[0]}, expected ${expectedUrl}`
        );
      }

      const ogUrl = extractMetadataValues(
        html,
        /<meta property="og:url" content="([^"]*)"/g
      );
      if (enforcesMetadata && ogUrl.length === 1 && ogUrl[0] !== expectedUrl) {
        failures.push(`${rel}: og:url is ${ogUrl[0]}, expected ${expectedUrl}`);
      }
    }

    if (file.endsWith('.css')) {
      const css = await readFile(file, 'utf8');

      for (const url of extractCssUrls(css)) {
        if (url.startsWith('data:') || url.startsWith('http')) continue;
        const problem = checkInternalReferenceFor(url, basePath);
        if (problem) {
          failures.push(`${rel}: ${problem}`);
          continue;
        }
        if (!isInternalReference(url)) continue;
        const candidates = resolveExportPathFor(outDir, url, basePath);
        if (candidates && !(await pathExistsAny(candidates))) {
          failures.push(`${rel}: local CSS reference does not exist: ${url}`);
        }
      }
    }
  }

  const favicon = faviconPathFor(basePath);
  const faviconCandidates = resolveExportPathFor(outDir, favicon, basePath);
  if (!faviconCandidates || !(await pathExistsAny(faviconCandidates))) {
    failures.push(`favicon is not exported: ${favicon}`);
  }

  const home = await readFile(join(outDir, 'index.html'), 'utf8').catch(
    () => ''
  );
  for (const match of home.matchAll(
    /<link[^>]+rel="canonical"[^>]+href="([^"]+)"/g
  )) {
    if (!match[1].startsWith(CANONICAL_ROOT)) {
      failures.push(`canonical URL outside site origin: ${match[1]}`);
    }
  }
  for (const match of home.matchAll(
    /property="og:url"[^>]+content="([^"]+)"/g
  )) {
    if (!match[1].startsWith(CANONICAL_ROOT)) {
      failures.push(`og:url outside site origin: ${match[1]}`);
    }
  }

  failures.push(...(await checkSearchIndexFor(outDir, basePath)));

  failures.push(...(await checkLayout(outDir)));

  return failures;
}

/**
 * Builds the complete check surface for one serving mode.
 *
 * Tests use this so a case is written once and executed against both modes
 * instead of pinning the constant serving base and skipping the rest.
 *
 * @param {{ target: string, basePath: string, preview: boolean, previewOrigin?: string }} mode
 */
export function createExportValidator(mode) {
  const base = mode.basePath;

  return {
    mode,
    BASE_PATH: base,
    SITE_ORIGIN: PRODUCTION_ORIGIN,
    CANONICAL_ROOT,
    FAVICON_PATH: faviconPathFor(base),
    ROUTES,
    listFiles,
    resolveExportPath: (outDir, urlPath) =>
      resolveExportPathFor(outDir, urlPath, base),
    extractReferences,
    extractCssUrls,
    extractFragmentLinks: (html, pageRoute) =>
      extractFragmentLinks(html, pageRoute, base),
    extractAnchorIds,
    countNestedParagraphs,
    isInternalReference,
    checkInternalReference: (value) => checkInternalReferenceFor(value, base),
    routeFromExportFile: (rel) => routeFromExportFileFor(rel, base),
    extractMetadataValues,
    extractRobotsValues,
    siteUrl,
    checkSearchIndex: (outDir) => checkSearchIndexFor(outDir, base),
    checkPreviewHeaders: (outDir) => checkPreviewHeadersFor(outDir, mode),
    checkRobots: (outDir) => checkRobotsFor(outDir, mode),
    checkExport: (outDir) => checkExportFor(outDir, base),
  };
}

/** @deprecated use `createExportValidator(mode).checkExport` */
export const checkExport = checkExportFor;

/**
 * Validates the build currently in `out/`, using the same target resolution as
 * the build that produced it.
 */
async function main() {
  const outDir = join(siteRoot, 'out');

  if (!(await exists(outDir))) {
    console.error(
      `check:export failed: ${outDir} does not exist. Run the build first.`
    );
    process.exitCode = 1;
    return;
  }

  let mode;
  try {
    mode = resolveValidationMode();
  } catch (error) {
    console.error(`check:export failed: ${error.message}`);
    process.exitCode = 1;
    return;
  }

  const failures = [
    ...(await checkExportFor(outDir, mode.basePath)),
    ...(await checkPreviewHeadersFor(outDir, mode)),
    ...(await checkRobotsFor(outDir, mode)),
  ];

  if (failures.length > 0) {
    console.error(`check:export failed with ${failures.length} problem(s):`);
    for (const failure of failures) console.error(`  - ${failure}`);
    process.exitCode = 1;
    return;
  }

  const serving = mode.basePath === '' ? '(origin root)' : mode.basePath;
  console.log(
    `check:export passed [${mode.target}]: ${ROUTES.length} routes and all local HTML/CSS references resolve under ${serving}`
  );
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))
) {
  await main();
}
