#!/usr/bin/env node
/**
 * Deterministic validation of the exported static site.
 *
 * The checks read `out/` (produced by `pnpm build`) and fail on:
 *   - missing expected routes
 *   - internal references that escape `/gqty/`
 *   - local references that do not resolve to a file in the export
 *   - markdown fragment links whose target heading does not exist
 *   - per-page metadata that is missing, duplicated, or not the page's own URL
 *   - search-index routes that would resolve somewhere other than the export
 *   - expired-domain, proprietary-CSS, or build-time-secret assumptions
 *
 * Nothing here executes the site or talks to the network.
 */

import { access, readFile, readdir } from 'node:fs/promises';
import { constants } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const siteRoot = resolve(here, '..');

export const BASE_PATH = '/gqty';
export const SITE_ORIGIN = 'https://gqty-dev.github.io';
export const CANONICAL_ROOT = `${SITE_ORIGIN}${BASE_PATH}`;

/** Public file that must be reachable at the origin root, outside `basePath`. */
export const FAVICON_PATH = '/gqty/favicon.ico';

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
export const METADATA_EXEMPT_ROUTES = new Set([
  `${BASE_PATH}/404.html`,
  `${BASE_PATH}/404/`,
  `${BASE_PATH}/500.html`,
  `${BASE_PATH}/500/`,
]);

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
  { pattern: 'gqty.dev', reason: 'expired domain' },
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

/** Local reference prefixes that are expected to stay outside `BASE_PATH`. */
const ALLOWED_ROOT_REFERENCES = new Set(['/', '/favicon.ico']);

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
export function resolveExportPath(outDir, urlPath) {
  const withoutQuery = urlPath.split('#')[0].split('?')[0];
  if (!withoutQuery.startsWith(BASE_PATH)) return undefined;

  const sitePath = withoutQuery.slice(BASE_PATH.length);
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
export function extractFragmentLinks(html, pageRoute) {
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
      path === BASE_PATH || path === `${BASE_PATH}/`
        ? `${BASE_PATH}/`
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

/** Reads the route a page file belongs to, as used in canonical URLs. */
export function routeFromExportFile(rel) {
  const normalized = rel.replaceAll('\\', '/');
  if (normalized === 'index.html') return `${BASE_PATH}/`;
  if (normalized.endsWith('/index.html')) {
    return `${BASE_PATH}/${normalized.slice(0, -'index.html'.length)}`;
  }
  return `${BASE_PATH}/${normalized}`;
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

export function checkInternalReference(value) {
  if (!isInternalReference(value)) return undefined;
  if (ALLOWED_ROOT_REFERENCES.has(value)) return undefined;
  if (value.startsWith(`${BASE_PATH}/`) || value === BASE_PATH)
    return undefined;

  return `internal reference escapes ${BASE_PATH}: ${value}`;
}

/**
 * Validates the exported Nextra search index.
 *
 * The theme loads `nextra-data-<locale>.json` from
 * `<basePath>/_next/static/chunks/`, builds one result URL per index key, and
 * renders each result through `next/link`, which applies `basePath` itself.
 * A key therefore has to be unprefixed: a prefixed key resolves to
 * `/gqty/gqty/...` once the link is rendered.
 */
export async function checkSearchIndex(outDir) {
  const failures = [];
  const chunksDir = join(outDir, '_next', 'static', 'chunks');

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
      if (route.startsWith(`${BASE_PATH}/`) || route === BASE_PATH) {
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
      const themeUrl = `${BASE_PATH}${route}`;
      const candidates = resolveExportPath(outDir, themeUrl);
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
 * Runs every check against an export directory.
 *
 * @param {string} outDir
 * @returns {Promise<string[]>} list of failures; empty means success
 */
export async function checkExport(outDir) {
  const failures = [];

  for (const route of ROUTES) {
    const candidates = resolveExportPath(outDir, `${BASE_PATH}${route}`);
    if (!candidates || !(await pathExistsAny(candidates))) {
      failures.push(`missing expected route: ${BASE_PATH}${route}`);
    }
  }

  const files = await listFiles(outDir);

  /** Anchor ids per exported route, so fragment links can be validated. */
  const anchorIds = new Map();
  for (const file of files) {
    if (!file.endsWith('.html')) continue;
    const rel = relative(outDir, file);
    anchorIds.set(
      routeFromExportFile(rel),
      extractAnchorIds(await readFile(file, 'utf8'))
    );
  }

  for (const file of files) {
    const rel = relative(outDir, file);

    if (file.endsWith('.html')) {
      const html = await readFile(file, 'utf8');

      for (const { value } of extractReferences(html)) {
        const problem = checkInternalReference(value);
        if (problem) {
          failures.push(`${rel}: ${problem}`);
          continue;
        }

        if (!isInternalReference(value)) continue;
        const candidates = resolveExportPath(outDir, value);
        if (candidates && !(await pathExistsAny(candidates))) {
          failures.push(`${rel}: local reference does not exist: ${value}`);
        }
      }

      const fragmentPageRoute = routeFromExportFile(rel);
      for (const { route, fragment } of extractFragmentLinks(
        html,
        fragmentPageRoute
      )) {
        if (!route.startsWith(`${BASE_PATH}/`)) continue;
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

      const pageRoute = routeFromExportFile(rel);
      const enforcesMetadata = !METADATA_EXEMPT_ROUTES.has(pageRoute);

      for (const { label, pattern } of METADATA_FIELDS) {
        if (!enforcesMetadata) break;
        const values = extractMetadataValues(html, pattern);
        if (values.length !== 1) {
          failures.push(
            `${rel}: expected exactly one ${label}, found ${values.length}`
          );
        }
      }

      const expectedUrl = `${CANONICAL_ROOT}${pageRoute.slice(BASE_PATH.length)}`;

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
        const problem = checkInternalReference(url);
        if (problem) {
          failures.push(`${rel}: ${problem}`);
          continue;
        }
        if (!isInternalReference(url)) continue;
        const candidates = resolveExportPath(outDir, url);
        if (candidates && !(await pathExistsAny(candidates))) {
          failures.push(`${rel}: local CSS reference does not exist: ${url}`);
        }
      }
    }
  }

  const faviconCandidates = resolveExportPath(outDir, FAVICON_PATH);
  if (!faviconCandidates || !(await pathExistsAny(faviconCandidates))) {
    failures.push(`favicon is not exported: ${FAVICON_PATH}`);
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

  failures.push(...(await checkSearchIndex(outDir)));

  return failures;
}

async function main() {
  const outDir = join(siteRoot, 'out');

  if (!(await exists(outDir))) {
    console.error(
      `check:export failed: ${outDir} does not exist. Run the build first.`
    );
    process.exitCode = 1;
    return;
  }

  const failures = await checkExport(outDir);

  if (failures.length > 0) {
    console.error(`check:export failed with ${failures.length} problem(s):`);
    for (const failure of failures) console.error(`  - ${failure}`);
    process.exitCode = 1;
    return;
  }

  console.log(
    `check:export passed: ${ROUTES.length} routes and all local HTML/CSS references resolve under ${BASE_PATH}`
  );
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))
) {
  await main();
}
