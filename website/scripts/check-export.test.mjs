import assert from 'node:assert/strict';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';

import {
  CANONICAL_ROOT,
  GITHUB_PAGES_BASE_PATH,
  PRODUCTION_ORIGIN,
  GITHUB_PAGES_TARGET,
  CLOUDFLARE_PREVIEW_TARGET,
  createExportValidator,
  siteUrl as immutableSiteUrl,
} from './check-export.mjs';

/**
 * Every check in this file runs in both hosting modes.
 *
 * The two modes differ in exactly one visible way — the serving base is
 * `/gqty` on GitHub Pages and the origin root on a Cloudflare preview — while
 * the canonical namespace, the route set, the metadata rules, the reference
 * rules, and the layout guards are identical. A single suite instantiated
 * twice therefore proves the same 78 cases in both, rather than skipping the
 * target-sensitive ones.
 */
const MODES = [
  {
    name: 'github-pages',
    target: GITHUB_PAGES_TARGET,
    basePath: GITHUB_PAGES_BASE_PATH,
    preview: false,
    previewOrigin: undefined,
  },
  {
    name: 'cloudflare-preview',
    target: CLOUDFLARE_PREVIEW_TARGET,
    basePath: '',
    preview: true,
    previewOrigin: 'https://abc123.gqty-preview.pages.dev',
  },
];

/** The serving-base prefixes a fixture must use for the mode under test. */
function testModes() {
  const current = process.env.GQTY_TEST_BUILD_TARGET;
  return current ? MODES.filter((mode) => mode.target === current) : MODES;
}

/**
 * Runs one exported check function body once per hosting mode.
 *
 * `validate` receives the mode plus the constants derived from it, so a test
 * never has to re-derive the base path by hand and can never accidentally
 * assert GitHub Pages behaviour while the preview validator is loaded.
 */
for (const mode of testModes()) {
  const {
    BASE_PATH,
    CANONICAL_ROOT: canonicalRoot,
    FAVICON_PATH,
    ROUTES,
    checkExport,
    checkInternalReference,
    checkSearchIndex,
    checkPreviewHeaders,
    countNestedParagraphs,
    extractAnchorIds,
    extractCssUrls,
    extractFragmentLinks,
    extractMetadataValues,
    extractReferences,
    extractRobotsValues,
    isInternalReference,
    resolveExportPath,
    routeFromExportFile,
    siteUrl,
    checkRobots,
  } = createExportValidator(mode);

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

  /**
   * The responsive-layout guards the landing page depends on, mirroring the
   * selectors `checkLayout` asserts. A healthy export fixture must carry them,
   * otherwise the layout check would report a failure for the fixture itself
   * rather than for the behaviour under test.
   */
  const layoutGuards = [
    '.roadmap__anchor{position:relative;top:-5rem;display:block;grid-column:1/-1;height:0}',
    '.hero__figure img{max-width:100%;min-width:0;height:auto}',
    '.usp__media,.usp__panel{position:relative;overflow:hidden}',
    '.usp__media{width:100%}',
  ].join('');

  /**
   * The preview-only `_headers` file. Its absence is required on GitHub Pages
   * and its presence is required on a preview, so the healthy fixture has to
   * carry the right one for the mode.
   */
  const headersFile = mode.preview
    ? { _headers: '/*\n  X-Robots-Tag: noindex, nofollow\n' }
    : {};

  /** A small export that passes every check, with the routes a test cares about. */
  async function makeHealthyExport() {
    const dir = await makeExport({
      ...headersFile,
      'index.html': [
        pageMetadata(`${CANONICAL_ROOT}/`),
        `<a href="${BASE_PATH}/getting-started/">start</a>`,
      ].join(''),
      '_next/static/site.css': `a{background:url(${BASE_PATH}/logo/gqty.svg)}${layoutGuards}`,
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

  const suite = mode.preview ? `${mode.name}: ` : '';

  test(`${suite}internal reference detection ignores external, protocol-relative, and hash links`, () => {
    assert.equal(isInternalReference(`${BASE_PATH}/concepts/`), true);
    assert.equal(
      isInternalReference('https://github.com/gqty-dev/gqty'),
      false
    );
    assert.equal(isInternalReference('//cdn.example.com/x.js'), false);
    assert.equal(isInternalReference('#playground'), false);
  });

  test(`${suite}internal reference check accepts the base path and rejects root-absolute paths`, () => {
    assert.equal(checkInternalReference(`${BASE_PATH}/concepts/`), undefined);
    assert.equal(checkInternalReference(BASE_PATH), undefined);
    if (BASE_PATH === '') {
      // With an empty serving base the only forbidden path is a path that is
      // not site-absolute at all; every root-absolute path is inside the site.
      assert.equal(checkInternalReference('/concepts/'), undefined);
      assert.equal(checkInternalReference('/_next/static/chunk.js'), undefined);
      assert.equal(
        checkInternalReference('/concepts/'),
        undefined,
        'a root-absolute path cannot escape an empty serving base'
      );
      assert.equal(
        isInternalReference('concepts/'),
        false,
        'a relative path is not an internal reference'
      );
      return;
    }

    assert.equal(
      checkInternalReference('/concepts/'),
      `internal reference escapes ${BASE_PATH}: /concepts/`
    );
    assert.equal(
      checkInternalReference('/_next/static/chunk.js'),
      `internal reference escapes ${BASE_PATH}: /_next/static/chunk.js`
    );
  });

  test(`${suite}internal reference check allows the framework root preconnect but not root-absolute assets`, () => {
    assert.equal(checkInternalReference('/'), undefined);
    if (BASE_PATH === '') {
      assert.equal(checkInternalReference('/favicon.ico'), undefined);
      assert.equal(
        checkInternalReference(`${BASE_PATH}/favicon.ico`),
        undefined
      );
      return;
    }

    assert.equal(
      checkInternalReference('/favicon.ico'),
      `internal reference escapes ${BASE_PATH}: /favicon.ico`
    );
    assert.equal(checkInternalReference(`${BASE_PATH}/favicon.ico`), undefined);
  });

  test(`${suite}directory-backed route resolution maps to index.html`, () => {
    const candidates = resolveExportPath('/out', `${BASE_PATH}/concepts/`);
    assert.ok(candidates?.[0].endsWith(join('concepts', 'index.html')));
  });

  test(`${suite}anchor and query strings are stripped before resolving a route`, () => {
    const candidates = resolveExportPath('/out', `${BASE_PATH}/#roadmap`);
    assert.ok(candidates?.[0].endsWith('index.html'));
  });

  test(`${suite}reference extraction reads href, src, and every srcset candidate`, () => {
    const html = [
      `<a href="${BASE_PATH}/concepts/">x</a>`,
      `<img src="${BASE_PATH}/a.png" srcset="${BASE_PATH}/a.png 1x, ${BASE_PATH}/b.png 2x">`,
    ].join('');

    const values = extractReferences(html).map((ref) => ref.value);
    assert.deepEqual(values, [
      `${BASE_PATH}/concepts/`,
      `${BASE_PATH}/a.png`,
      `${BASE_PATH}/a.png`,
      `${BASE_PATH}/b.png`,
    ]);
  });

  test(`${suite}CSS url() extraction ignores data URIs`, () => {
    const css = `a{background:url(${BASE_PATH}/x.svg)}b{background:url(data:image/png;base64,AAA)}`;
    assert.deepEqual(extractCssUrls(css), [
      `${BASE_PATH}/x.svg`,
      'data:image/png;base64,AAA',
    ]);
  });

  test(`${suite}exported file paths map back to their route`, () => {
    assert.equal(routeFromExportFile('index.html'), `${BASE_PATH}/`);
    assert.equal(
      routeFromExportFile(join('guides', 'react', 'read', 'index.html')),
      `${BASE_PATH}/guides/react/read/`
    );
    assert.equal(routeFromExportFile('404.html'), `${BASE_PATH}/404.html`);
  });

  test(`${suite}fragment links are read for both bare and routed hrefs`, () => {
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

  test(`${suite}anchor ids are collected from the rendered page`, () => {
    const ids = extractAnchorIds(
      '<h2 id="install">Install</h2><a class="subheading-anchor" href="#usage" id="usage"></a>'
    );
    assert.deepEqual([...ids].sort(), ['install', 'usage']);
  });

  test(`${suite}metadata extraction returns every value, not just the first`, () => {
    const html =
      '<meta name="description" content="one"><meta name="description" content="two">';
    assert.deepEqual(
      extractMetadataValues(
        html,
        /<meta name="description" content="([^"]*)"/g
      ),
      ['one', 'two']
    );
  });

  test(`${suite}a paragraph inside a paragraph is counted`, () => {
    // The shape MDX emits for an explicit `<p>` whose text spans lines: the
    // author's paragraph ends up wrapping a Markdown paragraph. Browsers cannot
    // represent this, repair the tree while parsing, and React then fails
    // hydration with a server/client mismatch.
    const html =
      '<p class="route-card__text"><p class="nx-mt-6 nx-leading-7">For React compatible UI frameworks.</p></p>';

    assert.equal(countNestedParagraphs(html), 1);
  });

  test(`${suite}sibling paragraphs and non-paragraph nesting are not counted`, () => {
    assert.equal(countNestedParagraphs('<p>a</p><p>b</p>'), 0);
    assert.equal(countNestedParagraphs('<p><img src="x"><br>a</p><p>b</p>'), 0);
    assert.equal(countNestedParagraphs('<div><p>a</p><p>b</p></div>'), 0);
    assert.equal(countNestedParagraphs('<p>a</p></p><p>b</p>'), 0);
    assert.equal(countNestedParagraphs(''), 0);
  });

  test(`${suite}every nested paragraph is counted, not just the first`, () => {
    assert.equal(countNestedParagraphs('<p><p>x</p></p><p><p>y</p></p>'), 2);
    assert.equal(countNestedParagraphs('<p><p><p>x</p></p></p>'), 2);
  });

  test(`${suite}a healthy export passes every check`, async () => {
    const dir = await makeHealthyExport();

    try {
      assert.deepEqual(await failuresIgnoringRoutes(dir), []);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  test(`${suite}a duplicate page description is reported`, async () => {
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

  test(`${suite}a missing canonical is reported rather than silently skipped`, async () => {
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

  test(`${suite}a page whose canonical points at a different route is reported`, async () => {
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

  test(`${suite}a canonical that merely starts with the site origin is reported`, async () => {
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

  test(`${suite}framework-generated 404 pages are exempt from per-page metadata`, async () => {
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

  test(`${suite}the metadata exemption does not extend to content pages`, async () => {
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

  test(`${suite}Nextra attribution metadata is reported`, async () => {
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

  test(`${suite}a fragment link to a heading that does not exist is reported`, async () => {
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

  test(`${suite}a bare fragment link on its own page is validated too`, async () => {
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

  test(`${suite}a fragment link to an existing heading is accepted`, async () => {
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

  test(`${suite}a root-relative asset is reported`, async () => {
    const escapingAsset =
      BASE_PATH === '' ? 'https://cdn.example.com/x.svg' : '/logo/gqty.svg';
    const dir = await makeExport({
      'index.html': `<img src="${escapingAsset}">`,
      'logo/gqty.svg': '<svg/>',
    });

    try {
      const failures = await checkExport(dir);
      if (BASE_PATH === '') {
        // Nothing inside a root-served export can escape the serving base, so
        // the guard is exercised through the reference check itself instead.
        assert.deepEqual(
          failures.filter((failure) => failure.includes('escapes')),
          []
        );
        assert.equal(
          isInternalReference(escapingAsset),
          false,
          'an external asset must not be treated as an escaping internal reference'
        );
        return;
      }
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

  test(`${suite}a broken local link is reported`, async () => {
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

  test(`${suite}an expired-domain reference is reported`, async () => {
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

  test(`${suite}a proprietary design-system reference is reported`, async () => {
    const dir = await makeExport({
      'index.html': '<link rel="stylesheet" href="/reshaped/bundle.css">',
    });

    try {
      const failures = await checkExport(dir);
      assert.ok(
        failures.some((failure) =>
          failure.includes('proprietary design system')
        ),
        `expected a proprietary-reference failure, got: ${failures.join('; ')}`
      );
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  test(`${suite}a canonical URL outside the published origin is reported`, async () => {
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

  test(`${suite}a missing favicon is reported`, async () => {
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

  test(`${suite}an exported favicon satisfies the favicon check`, async () => {
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

  test(`${suite}documentation prose about GraphQL and SSR is not treated as a runtime failure`, async () => {
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

  test(`${suite}an export carrying a nested paragraph is reported`, async () => {
    // The regression this guards: an explicit `<p>` in MDX whose text spans
    // lines is re-parsed as Markdown, so `getting-started` exported
    // `<p class="route-card__text"><p class="nx-mt-6">…</p></p>`. The browser
    // repairs the impossible tree while parsing, and React reports a 418/423
    // hydration mismatch because its client markup no longer matches.
    const dir = await makeExport({
      'index.html': pageMetadata(`${CANONICAL_ROOT}/`),
      'getting-started/index.html': [
        pageMetadata(`${CANONICAL_ROOT}/getting-started/`),
        '<div class="route-cards">',
        '<p class="route-card__text">',
        '<p class="nx-mt-6 nx-leading-7 first:nx-mt-0">For React compatible UI frameworks.</p>',
        '</p>',
        '</div>',
      ].join(''),
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
            'getting-started/index.html: contains 1 paragraph element(s) nested inside a paragraph'
          )
        ),
        `expected a nested-paragraph failure, got: ${failures.join('; ')}`
      );
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  test(`${suite}an export whose paragraphs are all siblings passes the paragraph check`, async () => {
    const dir = await makeExport({
      'index.html': pageMetadata(`${CANONICAL_ROOT}/`),
      'getting-started/index.html': [
        pageMetadata(`${CANONICAL_ROOT}/getting-started/`),
        '<div class="route-cards">',
        '<p class="route-card__text">A single-line paragraph renders as text.</p>',
        '<p class="route-card__text">For React compatible UI frameworks.</p>',
        '</div>',
      ].join(''),
      '_next/static/chunks/nextra-data-en-US.json': JSON.stringify({
        '/': { title: 'Index' },
      }),
      'favicon.ico': 'icon',
    });

    try {
      const failures = await failuresIgnoringRoutes(dir);
      assert.deepEqual(
        failures.filter((failure) =>
          failure.includes('nested inside a paragraph')
        ),
        []
      );
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  test(`${suite}a search index with unprefixed route keys passes`, async () => {
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

  test(`${suite}a base-prefixed search index route is reported as a double prefix`, async () => {
    const dir = await makeExport({
      '_next/static/chunks/nextra-data-en-US.json': JSON.stringify({
        [`${GITHUB_PAGES_BASE_PATH}/concepts`]: { title: 'Concepts' },
      }),
      'concepts/index.html': pageMetadata(`${CANONICAL_ROOT}/concepts/`),
    });

    try {
      const failures = await checkSearchIndex(dir);
      assert.ok(
        failures.some((failure) =>
          failure.includes(
            `search index route is already base-prefixed and would double-prefix: ${GITHUB_PAGES_BASE_PATH}/concepts`
          )
        ),
        `expected a double-prefix failure, got: ${failures.join('; ')}`
      );
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  test(`${suite}a search index route with no matching page is reported`, async () => {
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

  test(`${suite}a missing search index is reported`, async () => {
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

  test(`${suite}an empty search index is reported`, async () => {
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

  test(`${suite}a malformed search index is reported rather than throwing`, async () => {
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

  // ---------------------------------------------------------------------
  // Preview-header policy: required in preview mode, forbidden otherwise.
  // ---------------------------------------------------------------------
  const PREVIEW_HEADERS_FIXTURE = '/*\n  X-Robots-Tag: noindex, nofollow\n';

  test(`${suite}a healthy export carries exactly the header policy its host requires`, async () => {
    const dir = await makeHealthyExport();

    try {
      assert.deepEqual(await checkPreviewHeaders(dir), []);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  if (mode.preview) {
    test(`${suite}a preview export without _headers is reported`, async () => {
      const dir = await makeExport({
        'index.html': pageMetadata(`${CANONICAL_ROOT}/`),
      });

      try {
        const failures = await checkPreviewHeaders(dir);
        assert.ok(
          failures.some((failure) =>
            failure.includes('preview export is missing _headers')
          ),
          `expected a missing-_headers failure, got: ${failures.join('; ')}`
        );
      } finally {
        await rm(dir, { recursive: true, force: true });
      }
    });

    test(`${suite}a preview _headers without the noindex directive is reported`, async () => {
      const dir = await makeExport({
        'index.html': pageMetadata(`${CANONICAL_ROOT}/`),
        _headers: '/*\n  X-Frame-Options: DENY\n',
      });

      try {
        const failures = await checkPreviewHeaders(dir);
        assert.ok(
          failures.some((failure) =>
            failure.includes('X-Robots-Tag: noindex, nofollow')
          ),
          `expected a missing-directive failure, got: ${failures.join('; ')}`
        );
      } finally {
        await rm(dir, { recursive: true, force: true });
      }
    });

    test(`${suite}a preview _headers scoped to the wrong path is reported`, async () => {
      const dir = await makeExport({
        'index.html': pageMetadata(`${CANONICAL_ROOT}/`),
        _headers: '/api/*\n  X-Robots-Tag: noindex, nofollow\n',
      });

      try {
        const failures = await checkPreviewHeaders(dir);
        assert.ok(
          failures.some((failure) => failure.includes('must target /*')),
          `expected a wrong-path failure, got: ${failures.join('; ')}`
        );
      } finally {
        await rm(dir, { recursive: true, force: true });
      }
    });
  } else {
    test(`${suite}a GitHub Pages export carrying preview _headers is reported`, async () => {
      const dir = await makeExport({
        'index.html': pageMetadata(`${CANONICAL_ROOT}/`),
        _headers: PREVIEW_HEADERS_FIXTURE,
      });

      try {
        const failures = await checkPreviewHeaders(dir);
        assert.ok(
          failures.some((failure) =>
            failure.includes('must not be present in a github-pages export')
          ),
          `expected a stale-_headers failure, got: ${failures.join('; ')}`
        );
      } finally {
        await rm(dir, { recursive: true, force: true });
      }
    });

    test(`${suite}an export without _headers is accepted in default mode`, async () => {
      const dir = await makeExport({
        'index.html': pageMetadata(`${CANONICAL_ROOT}/`),
      });

      try {
        assert.deepEqual(await checkPreviewHeaders(dir), []);
      } finally {
        await rm(dir, { recursive: true, force: true });
      }
    });
  }

  // ---------------------------------------------------------------------
  // Robots metadata: indexable in production, non-indexable on preview.
  // ---------------------------------------------------------------------
  const ROBOTS_META = (content) => `<meta name="robots" content="${content}">`;

  test(`${suite}the robots directive matches the hosting mode`, async () => {
    const dir = await makeExport({
      'index.html': [
        pageMetadata(`${CANONICAL_ROOT}/`),
        ROBOTS_META(mode.preview ? 'noindex,nofollow' : 'index,follow'),
      ].join(''),
      '_next/static/chunks/nextra-data-en-US.json': JSON.stringify({
        '/': { title: 'Index' },
      }),
      'favicon.ico': 'icon',
    });

    try {
      assert.deepEqual(await checkRobots(dir), []);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  test(`${suite}a missing robots directive is reported`, async () => {
    const dir = await makeExport({
      'index.html': pageMetadata(`${CANONICAL_ROOT}/`),
      '_next/static/chunks/nextra-data-en-US.json': JSON.stringify({
        '/': { title: 'Index' },
      }),
      'favicon.ico': 'icon',
    });

    try {
      const failures = await checkRobots(dir);
      assert.ok(
        failures.some((failure) =>
          failure.includes('expected exactly one robots directive, found 0')
        ),
        `expected a missing-robots failure, got: ${failures.join('; ')}`
      );
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  test(`${suite}the wrong robots directive for the mode is reported`, async () => {
    const dir = await makeExport({
      'index.html': [
        pageMetadata(`${CANONICAL_ROOT}/`),
        ROBOTS_META(mode.preview ? 'index,follow' : 'noindex,nofollow'),
      ].join(''),
      '_next/static/chunks/nextra-data-en-US.json': JSON.stringify({
        '/': { title: 'Index' },
      }),
      'favicon.ico': 'icon',
    });

    try {
      const failures = await checkRobots(dir);
      assert.ok(
        failures.some((failure) =>
          failure.includes(
            `robots is ${mode.preview ? 'index,follow' : 'noindex,nofollow'}, expected ${mode.preview ? 'noindex,nofollow' : 'index,follow'}`
          )
        ),
        `expected a wrong-robots failure, got: ${failures.join('; ')}`
      );
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  test(`${suite}a duplicated robots directive is reported`, async () => {
    const directive = mode.preview ? 'noindex,nofollow' : 'index,follow';
    const dir = await makeExport({
      'index.html': [
        pageMetadata(`${CANONICAL_ROOT}/`),
        ROBOTS_META(directive),
        ROBOTS_META(directive),
      ].join(''),
      '_next/static/chunks/nextra-data-en-US.json': JSON.stringify({
        '/': { title: 'Index' },
      }),
      'favicon.ico': 'icon',
    });

    try {
      const failures = await checkRobots(dir);
      assert.ok(
        failures.some((failure) =>
          failure.includes('expected exactly one robots directive, found 2')
        ),
        `expected a duplicate-robots failure, got: ${failures.join('; ')}`
      );
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  test(`${suite}the framework 404 page is exempt from the robots check`, async () => {
    const dir = await makeExport({
      'index.html': [
        pageMetadata(`${CANONICAL_ROOT}/`),
        ROBOTS_META(mode.preview ? 'noindex,nofollow' : 'index,follow'),
      ].join(''),
      '404.html': '<p>Not found</p>',
      '404/index.html': '<p>Not found</p>',
      '_next/static/chunks/nextra-data-en-US.json': JSON.stringify({
        '/': { title: 'Index' },
      }),
      'favicon.ico': 'icon',
    });

    try {
      assert.deepEqual(await checkRobots(dir), []);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  test(`${suite}robots extraction reads every occurrence`, () => {
    assert.deepEqual(
      extractRobotsValues(
        `${ROBOTS_META('index,follow')}${ROBOTS_META('noindex,nofollow')}`
      ),
      ['index,follow', 'noindex,nofollow']
    );
    assert.deepEqual(extractRobotsValues('<html></html>'), []);
  });

  // ---------------------------------------------------------------------
  // Canonical namespace is target-independent, serving base is not.
  // ---------------------------------------------------------------------
  test(`${suite}canonical and og:url always name the production GitHub Pages route`, async () => {
    const dir = await makeHealthyExport();

    try {
      const home = await import('node:fs/promises').then((fs) =>
        fs.readFile(join(dir, 'index.html'), 'utf8')
      );

      assert.ok(
        home.includes(`<link rel="canonical" href="${CANONICAL_ROOT}/">`)
      );
      assert.ok(
        home.includes(`<meta property="og:url" content="${CANONICAL_ROOT}/">`)
      );
      assert.ok(!home.includes('pages.dev'));
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  test(`${suite}a canonical built from the serving base instead of production is reported`, async () => {
    // The preview failure mode: with an empty serving base, a page whose
    // canonical is derived from `basePath` collapses to the bare origin, and
    // on GitHub Pages it would repeat the already-correct prefix. Either way
    // the canonical must be the production `/gqty` route, so the fixture
    // emits `${PRODUCTION_ORIGIN}${BASE_PATH}/` for the home page and the
    // mode's own contradiction otherwise.
    const wrongUrl = `${PRODUCTION_ORIGIN}${BASE_PATH}/`;
    const dir = await makeExport({
      'index.html': pageMetadata(wrongUrl),
      'getting-started/index.html': pageMetadata(wrongUrl),
      '_next/static/chunks/nextra-data-en-US.json': JSON.stringify({
        '/': { title: 'Index' },
      }),
      'favicon.ico': 'icon',
      '_next/static/site.css': layoutGuards,
    });

    try {
      // The home page is the one route where that URL is legitimate; the
      // nested route proves the mismatch is caught.
      const failures = await failuresIgnoringRoutes(dir);
      assert.ok(
        failures.some((failure) =>
          failure.includes(
            `getting-started/index.html: canonical is ${wrongUrl}, expected ${CANONICAL_ROOT}/getting-started/`
          )
        ),
        `expected a canonical mismatch, got: ${failures.join('; ')}`
      );
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  test(`${suite}the mode's preferred canonical URL for a route is used by metadata`, () => {
    assert.equal(siteUrl('/concepts/'), `${canonicalRoot}/concepts/`);
    assert.equal(immutableSiteUrl('/concepts/'), `${CANONICAL_ROOT}/concepts/`);
  });

  test(`${suite}routes and the favicon follow the serving base`, () => {
    assert.equal(BASE_PATH, mode.basePath);
    assert.equal(FAVICON_PATH, `${mode.basePath}/favicon.ico`);
    assert.ok(
      ROUTES.includes('/api-reference/react/use-query/'),
      'the canonical route list must not depend on the serving base'
    );
  });

  test(`${suite}a favicon emitted only at the wrong base is reported`, async () => {
    // The serving base is the only thing that moves a public file. A build that
    // exported the favicon one directory away from where the theme links it
    // would 404 the icon while every other asset resolved, so the check has to
    // follow the base rather than accept the other mode's location.
    const dir = await makeExport({
      'index.html': [
        pageMetadata(`${CANONICAL_ROOT}/`),
        `<link rel="icon" href="${FAVICON_PATH}" sizes="any">`,
      ].join(''),
      // Always the *other* mode's location, relative to this export root.
      [mode.preview ? 'gqty/favicon.ico' : 'nested/favicon.ico']: 'icon',
      '_next/static/chunks/nextra-data-en-US.json': JSON.stringify({
        '/': { title: 'Index' },
      }),
      '_next/static/site.css': layoutGuards,
    });

    try {
      const failures = await failuresIgnoringRoutes(dir);
      assert.ok(
        failures.some((failure) =>
          failure.includes(`favicon is not exported: ${FAVICON_PATH}`)
        ),
        `expected a favicon failure, got: ${failures.join('; ')}`
      );
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  // ---------------------------------------------------------------------
  // Search index resolves once, with or without a serving base.
  // ---------------------------------------------------------------------
  test(`${suite}a search index resolves through the mode's serving base`, async () => {
    const dir = await makeHealthyExport();

    try {
      assert.deepEqual(await checkSearchIndex(dir), []);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  if (mode.preview) {
    test(`${suite}prefixed search keys are still a double prefix when the base is empty`, async () => {
      const dir = await makeExport({
        '_next/static/chunks/nextra-data-en-US.json': JSON.stringify({
          [`${GITHUB_PAGES_BASE_PATH}/concepts`]: { title: 'Concepts' },
        }),
        'concepts/index.html': pageMetadata(`${CANONICAL_ROOT}/concepts/`),
      });

      try {
        const failures = await checkSearchIndex(dir);
        assert.ok(
          failures.some((failure) => failure.includes('double-prefix')),
          `expected a double-prefix failure, got: ${failures.join('; ')}`
        );
      } finally {
        await rm(dir, { recursive: true, force: true });
      }
    });

    test(`${suite}the proxy root key resolves to the exported index in preview mode`, async () => {
      const dir = await makeExport({
        '_next/static/chunks/nextra-data-en-US.json': JSON.stringify({
          '/': { title: 'Index' },
        }),
        'index.html': pageMetadata(`${CANONICAL_ROOT}/`),
      });

      try {
        assert.deepEqual(await checkSearchIndex(dir), []);
      } finally {
        await rm(dir, { recursive: true, force: true });
      }
    });
  }
}
