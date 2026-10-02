import assert from 'node:assert/strict';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';

import {
  BASE_PATH,
  CANONICAL_ROOT,
  FAVICON_PATH,
  checkExport,
  checkInternalReference,
  checkSearchIndex,
  extractAnchorIds,
  extractCssUrls,
  extractFragmentLinks,
  extractMetadataValues,
  extractReferences,
  isInternalReference,
  resolveExportPath,
  routeFromExportFile,
} from './check-export.mjs';

/**
 * Builds a minimal export directory containing only the files a test needs.
 * Routes are directory-backed `index.html` files, matching `trailingSlash: true`.
 */
async function makeExport(files) {
  const dir = join(
    tmpdir(),
    `gqty-export-check-${process.pid}-${Math.random().toString(36).slice(2)}`
  );
  await rm(dir, { recursive: true, force: true });

  for (const [path, contents] of Object.entries(files)) {
    const full = join(dir, path);
    await mkdir(join(full, '..'), { recursive: true });
    await writeFile(full, contents);
  }

  return dir;
}

/** Metadata block every healthy page is expected to carry. */
function pageMetadata(url) {
  return [
    '<meta name="description" content="A No-GraphQL Client for TypeScript">',
    `<link rel="canonical" href="${url}">`,
    '<meta property="og:title" content="GQty">',
    '<meta property="og:description" content="A No-GraphQL Client for TypeScript">',
    `<meta property="og:url" content="${url}">`,
  ].join('');
}

/** A small export that passes every check, with the routes a test cares about. */
async function makeHealthyExport() {
  const dir = await makeExport({
    'index.html': [
      pageMetadata(`${CANONICAL_ROOT}/`),
      `<a href="${BASE_PATH}/getting-started/">start</a>`,
    ].join(''),
    '_next/static/site.css': `a{background:url(${BASE_PATH}/logo/gqty.svg)}`,
    '_next/static/chunks/nextra-data-en-US.json': JSON.stringify({
      '/getting-started': { title: 'Quickstart' },
      '/': { title: 'Index' },
    }),
    'favicon.ico': 'icon',
    'logo/gqty.svg': '<svg/>',
    'getting-started/index.html': [
      pageMetadata(`${CANONICAL_ROOT}/getting-started/`),
      '<h2 id="install">Install</h2>',
      `<a href="${BASE_PATH}/">home</a>`,
    ].join(''),
  });

  return dir;
}

/** Runs `checkExport` and drops the route-list noise from `ROUTES`. */
async function failuresIgnoringRoutes(dir) {
  const failures = await checkExport(dir);
  return failures.filter(
    (failure) => !failure.startsWith('missing expected route:')
  );
}

test('internal reference detection ignores external, protocol-relative, and hash links', () => {
  assert.equal(isInternalReference('/gqty/'), true);
  assert.equal(isInternalReference('https://github.com/gqty-dev/gqty'), false);
  assert.equal(isInternalReference('//cdn.example.com/x.js'), false);
  assert.equal(isInternalReference('#playground'), false);
});

test('internal reference check accepts the base path and rejects root-absolute paths', () => {
  assert.equal(checkInternalReference(`${BASE_PATH}/concepts/`), undefined);
  assert.equal(checkInternalReference(BASE_PATH), undefined);
  assert.equal(
    checkInternalReference('/concepts/'),
    `internal reference escapes ${BASE_PATH}: /concepts/`
  );
  assert.equal(
    checkInternalReference('/_next/static/chunk.js'),
    `internal reference escapes ${BASE_PATH}: /_next/static/chunk.js`
  );
});

test('internal reference check allows the framework root preconnect but not root-absolute assets', () => {
  assert.equal(checkInternalReference('/'), undefined);
  assert.equal(
    checkInternalReference('/favicon.ico'),
    `internal reference escapes ${BASE_PATH}: /favicon.ico`
  );
  assert.equal(checkInternalReference(`${BASE_PATH}/favicon.ico`), undefined);
});

test('directory-backed route resolution maps to index.html', () => {
  const candidates = resolveExportPath('/out', `${BASE_PATH}/concepts/`);
  assert.ok(candidates?.[0].endsWith(join('concepts', 'index.html')));
});

test('anchor and query strings are stripped before resolving a route', () => {
  const candidates = resolveExportPath('/out', `${BASE_PATH}/#roadmap`);
  assert.ok(candidates?.[0].endsWith('index.html'));
});

test('reference extraction reads href, src, and every srcset candidate', () => {
  const html = [
    '<a href="/gqty/concepts/">x</a>',
    '<img src="/gqty/a.png" srcset="/gqty/a.png 1x, /gqty/b.png 2x">',
  ].join('');

  const values = extractReferences(html).map((ref) => ref.value);
  assert.deepEqual(values, [
    '/gqty/concepts/',
    '/gqty/a.png',
    '/gqty/a.png',
    '/gqty/b.png',
  ]);
});

test('CSS url() extraction ignores data URIs', () => {
  const css =
    'a{background:url(/gqty/x.svg)}b{background:url(data:image/png;base64,AAA)}';
  assert.deepEqual(extractCssUrls(css), [
    '/gqty/x.svg',
    'data:image/png;base64,AAA',
  ]);
});

test('exported file paths map back to their route', () => {
  assert.equal(routeFromExportFile('index.html'), `${BASE_PATH}/`);
  assert.equal(
    routeFromExportFile(join('guides', 'react', 'read', 'index.html')),
    `${BASE_PATH}/guides/react/read/`
  );
  assert.equal(routeFromExportFile('404.html'), `${BASE_PATH}/404.html`);
});

test('fragment links are read for both bare and routed hrefs', () => {
  const html = [
    '<a href="#install">bare</a>',
    `<a href="${BASE_PATH}/guides/react/read/#suspense">routed</a>`,
    '<a href="https://example.com/x#y">external</a>',
  ].join('');

  assert.deepEqual(extractFragmentLinks(html, `${BASE_PATH}/concepts/`), [
    { route: `${BASE_PATH}/concepts/`, fragment: 'install' },
    { route: `${BASE_PATH}/guides/react/read/`, fragment: 'suspense' },
  ]);
});

test('anchor ids are collected from the rendered page', () => {
  const ids = extractAnchorIds(
    '<h2 id="install">Install</h2><a class="subheading-anchor" href="#usage" id="usage"></a>'
  );
  assert.deepEqual([...ids].sort(), ['install', 'usage']);
});

test('metadata extraction returns every value, not just the first', () => {
  const html =
    '<meta name="description" content="one"><meta name="description" content="two">';
  assert.deepEqual(
    extractMetadataValues(html, /<meta name="description" content="([^"]*)"/g),
    ['one', 'two']
  );
});

test('a healthy export passes every check', async () => {
  const dir = await makeHealthyExport();

  try {
    assert.deepEqual(await failuresIgnoringRoutes(dir), []);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('a duplicate page description is reported', async () => {
  const dir = await makeHealthyExport();
  const home = await import('node:fs/promises').then((fs) =>
    fs.readFile(join(dir, 'index.html'), 'utf8')
  );

  try {
    await writeFile(
      join(dir, 'index.html'),
      `${home}<meta name="description" content="Nextra: the next docs builder">`
    );

    const failures = await failuresIgnoringRoutes(dir);
    assert.ok(
      failures.some((failure) =>
        failure.includes('expected exactly one description, found 2')
      ),
      `expected a duplicate-description failure, got: ${failures.join('; ')}`
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('a missing canonical is reported rather than silently skipped', async () => {
  const dir = await makeExport({
    'index.html':
      '<meta name="description" content="x"><meta property="og:title" content="x"><meta property="og:description" content="x">',
  });

  try {
    const failures = await failuresIgnoringRoutes(dir);
    assert.ok(
      failures.some((failure) =>
        failure.includes('expected exactly one canonical, found 0')
      ),
      `expected a missing-canonical failure, got: ${failures.join('; ')}`
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('a page whose canonical points at a different route is reported', async () => {
  const dir = await makeExport({
    'index.html': pageMetadata(`${CANONICAL_ROOT}/`),
    'getting-started/index.html': pageMetadata(`${CANONICAL_ROOT}/`),
  });

  try {
    const failures = await failuresIgnoringRoutes(dir);
    assert.ok(
      failures.some((failure) =>
        failure.includes(
          `getting-started/index.html: canonical is ${CANONICAL_ROOT}/, expected ${CANONICAL_ROOT}/getting-started/`
        )
      ),
      `expected a wrong-route canonical failure, got: ${failures.join('; ')}`
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('a canonical that merely starts with the site origin is reported', async () => {
  const dir = await makeExport({
    'index.html': pageMetadata(`${CANONICAL_ROOT}/getting-started`),
  });

  try {
    const failures = await failuresIgnoringRoutes(dir);
    assert.ok(
      failures.some((failure) => failure.includes('canonical is')),
      `expected a canonical mismatch, got: ${failures.join('; ')}`
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('framework-generated 404 pages are exempt from per-page metadata', async () => {
  const dir = await makeExport({
    'index.html': pageMetadata(`${CANONICAL_ROOT}/`),
    '404.html': '<p>Not found</p>',
    '404/index.html': '<p>Not found</p>',
    '_next/static/chunks/nextra-data-en-US.json': JSON.stringify({
      '/': { title: 'Index' },
    }),
    'favicon.ico': 'icon',
  });

  try {
    const failures = await failuresIgnoringRoutes(dir);
    assert.deepEqual(
      failures.filter((failure) => failure.includes('404')),
      []
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('the metadata exemption does not extend to content pages', async () => {
  const dir = await makeExport({
    'index.html': pageMetadata(`${CANONICAL_ROOT}/`),
    'getting-started/index.html': '<p>No metadata</p>',
    '_next/static/chunks/nextra-data-en-US.json': JSON.stringify({
      '/': { title: 'Index' },
    }),
    'favicon.ico': 'icon',
  });

  try {
    const failures = await failuresIgnoringRoutes(dir);
    assert.ok(
      failures.some((failure) =>
        failure.includes(
          'getting-started/index.html: expected exactly one description, found 0'
        )
      ),
      `expected a missing-metadata failure, got: ${failures.join('; ')}`
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('Nextra attribution metadata is reported', async () => {
  const dir = await makeHealthyExport();
  const home = await import('node:fs/promises').then((fs) =>
    fs.readFile(join(dir, 'index.html'), 'utf8')
  );

  try {
    await writeFile(
      join(dir, 'index.html'),
      `${home}<meta name="twitter:site" content="@shuding_">`
    );

    const failures = await failuresIgnoringRoutes(dir);
    assert.ok(
      failures.some((failure) =>
        failure.includes('Nextra theme author attribution')
      ),
      `expected an attribution failure, got: ${failures.join('; ')}`
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('a fragment link to a heading that does not exist is reported', async () => {
  const dir = await makeExport({
    'index.html': pageMetadata(`${CANONICAL_ROOT}/`),
    'getting-started/index.html': [
      pageMetadata(`${CANONICAL_ROOT}/getting-started/`),
      '<h2 id="install">Install</h2>',
      `<a href="${BASE_PATH}/guides/react/read/#suspense">suspense</a>`,
    ].join(''),
    'guides/react/read/index.html': [
      pageMetadata(`${CANONICAL_ROOT}/guides/react/read/`),
      '<h3 id="suspense-on-data-fetching">Suspense on Data Fetching</h3>',
    ].join(''),
  });

  try {
    const failures = await failuresIgnoringRoutes(dir);
    assert.ok(
      failures.some((failure) =>
        failure.includes(
          `fragment does not resolve: ${BASE_PATH}/guides/react/read/#suspense`
        )
      ),
      `expected a broken-fragment failure, got: ${failures.join('; ')}`
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('a bare fragment link on its own page is validated too', async () => {
  const dir = await makeExport({
    'index.html': [
      pageMetadata(`${CANONICAL_ROOT}/`),
      '<a href="#roadmap">roadmap</a>',
    ].join(''),
  });

  try {
    const failures = await failuresIgnoringRoutes(dir);
    assert.ok(
      failures.some((failure) =>
        failure.includes(`fragment does not resolve: ${BASE_PATH}/#roadmap`)
      ),
      `expected a bare-fragment failure, got: ${failures.join('; ')}`
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('a fragment link to an existing heading is accepted', async () => {
  const dir = await makeExport({
    'index.html': [
      pageMetadata(`${CANONICAL_ROOT}/`),
      '<a href="#roadmap">roadmap</a>',
      '<a class="subheading-anchor" href="#roadmap" id="roadmap"></a>',
    ].join(''),
    '_next/static/chunks/nextra-data-en-US.json': JSON.stringify({
      '/': { title: 'Index' },
    }),
    'favicon.ico': 'icon',
  });

  try {
    assert.deepEqual(await failuresIgnoringRoutes(dir), []);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('a root-relative asset is reported', async () => {
  const dir = await makeExport({
    'index.html': '<img src="/logo/gqty.svg">',
    'logo/gqty.svg': '<svg/>',
  });

  try {
    const failures = await checkExport(dir);
    assert.ok(
      failures.some((failure) =>
        failure.includes('internal reference escapes /gqty: /logo/gqty.svg')
      ),
      `expected an escaping-reference failure, got: ${failures.join('; ')}`
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('a broken local link is reported', async () => {
  const dir = await makeExport({
    'index.html': `<a href="${BASE_PATH}/missing-page/">gone</a>`,
  });

  try {
    const failures = await checkExport(dir);
    assert.ok(
      failures.some((failure) =>
        failure.includes('local reference does not exist')
      ),
      `expected a missing-reference failure, got: ${failures.join('; ')}`
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('an expired-domain reference is reported', async () => {
  // Built the same way as the detector's own pattern, so this fixture does not
  // reintroduce the expired domain as a literal in the repository.
  const href = `https://${['gqty', 'dev'].join('.')}/`;
  const dir = await makeExport({
    'index.html': `<a href="${href}">docs</a>`,
  });

  try {
    const failures = await checkExport(dir);
    assert.ok(
      failures.some((failure) => failure.includes('expired domain')),
      `expected an expired-domain failure, got: ${failures.join('; ')}`
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('a proprietary design-system reference is reported', async () => {
  const dir = await makeExport({
    'index.html': '<link rel="stylesheet" href="/reshaped/bundle.css">',
  });

  try {
    const failures = await checkExport(dir);
    assert.ok(
      failures.some((failure) => failure.includes('proprietary design system')),
      `expected a proprietary-reference failure, got: ${failures.join('; ')}`
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('a canonical URL outside the published origin is reported', async () => {
  const dir = await makeExport({
    'index.html': '<link rel="canonical" href="https://example.com/">',
  });

  try {
    const failures = await checkExport(dir);
    assert.ok(
      failures.some((failure) =>
        failure.includes('canonical URL outside site origin')
      ),
      `expected a canonical failure, got: ${failures.join('; ')}`
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('a missing favicon is reported', async () => {
  const dir = await makeExport({
    'index.html': pageMetadata(`${CANONICAL_ROOT}/`),
  });

  try {
    const failures = await failuresIgnoringRoutes(dir);
    assert.ok(
      failures.some((failure) =>
        failure.includes(`favicon is not exported: ${FAVICON_PATH}`)
      ),
      `expected a missing-favicon failure, got: ${failures.join('; ')}`
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('an exported favicon satisfies the favicon check', async () => {
  const dir = await makeHealthyExport();

  try {
    const failures = await failuresIgnoringRoutes(dir);
    assert.deepEqual(
      failures.filter((failure) => failure.includes('favicon')),
      []
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('documentation prose about GraphQL and SSR is not treated as a runtime failure', async () => {
  const dir = await makeExport({
    'index.html': [
      pageMetadata(`${CANONICAL_ROOT}/`),
      '<p>Use <code>getStaticProps</code> for SSR with GraphQL, or <code>useRouter</code>.</p>',
      `<a href="https://stackblitz.com/edit/nextjs-2jqmx4">playground</a>`,
    ].join(''),
    '_next/static/chunks/nextra-data-en-US.json': JSON.stringify({
      '/': { title: 'Index' },
    }),
    'favicon.ico': 'icon',
  });

  try {
    assert.deepEqual(await failuresIgnoringRoutes(dir), []);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('a search index with unprefixed route keys passes', async () => {
  const dir = await makeExport({
    '_next/static/chunks/nextra-data-en-US.json': JSON.stringify({
      '/': { title: 'Index' },
      '/concepts': { title: 'Concepts' },
    }),
    'index.html': pageMetadata(`${CANONICAL_ROOT}/`),
    'concepts/index.html': pageMetadata(`${CANONICAL_ROOT}/concepts/`),
  });

  try {
    assert.deepEqual(await checkSearchIndex(dir), []);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('a base-prefixed search index route is reported as a double prefix', async () => {
  const dir = await makeExport({
    '_next/static/chunks/nextra-data-en-US.json': JSON.stringify({
      [`${BASE_PATH}/concepts`]: { title: 'Concepts' },
    }),
    'concepts/index.html': pageMetadata(`${CANONICAL_ROOT}/concepts/`),
  });

  try {
    const failures = await checkSearchIndex(dir);
    assert.ok(
      failures.some((failure) =>
        failure.includes(
          `search index route is already base-prefixed and would double-prefix: ${BASE_PATH}/concepts`
        )
      ),
      `expected a double-prefix failure, got: ${failures.join('; ')}`
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('a search index route with no matching page is reported', async () => {
  const dir = await makeExport({
    '_next/static/chunks/nextra-data-en-US.json': JSON.stringify({
      '/concepts': { title: 'Concepts' },
    }),
  });

  try {
    const failures = await checkSearchIndex(dir);
    assert.ok(
      failures.some((failure) =>
        failure.includes(
          `search index route does not resolve after basePath: /concepts -> ${BASE_PATH}/concepts`
        )
      ),
      `expected an unresolved-route failure, got: ${failures.join('; ')}`
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('a missing search index is reported', async () => {
  const dir = await makeExport({ 'index.html': '<p>empty</p>' });

  try {
    const failures = await checkSearchIndex(dir);
    assert.ok(
      failures.some((failure) =>
        failure.includes('search index not found in the export')
      ),
      `expected a missing-index failure, got: ${failures.join('; ')}`
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('an empty search index is reported', async () => {
  const dir = await makeExport({
    '_next/static/chunks/nextra-data-en-US.json': '{}',
  });

  try {
    const failures = await checkSearchIndex(dir);
    assert.ok(
      failures.some((failure) =>
        failure.includes('search index nextra-data-en-US.json is empty')
      ),
      `expected an empty-index failure, got: ${failures.join('; ')}`
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('a malformed search index is reported rather than throwing', async () => {
  const dir = await makeExport({
    '_next/static/chunks/nextra-data-en-US.json': 'not json',
  });

  try {
    const failures = await checkSearchIndex(dir);
    assert.ok(
      failures.some((failure) => failure.includes('is not valid JSON')),
      `expected a malformed-index failure, got: ${failures.join('; ')}`
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
