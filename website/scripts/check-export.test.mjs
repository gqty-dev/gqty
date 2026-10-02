import assert from 'node:assert/strict';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';

import {
  BASE_PATH,
  CANONICAL_ROOT,
  checkExport,
  checkInternalReference,
  extractCssUrls,
  extractReferences,
  isInternalReference,
  resolveExportPath,
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

test("internal reference check allows the framework's own root preconnect", () => {
  assert.equal(checkInternalReference('/'), undefined);
  assert.equal(checkInternalReference('/favicon.ico'), undefined);
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

test('a healthy export passes every check', async () => {
  const dir = await makeExport({
    'index.html': [
      `<link rel="canonical" href="${CANONICAL_ROOT}/">`,
      `<meta property="og:url" content="${CANONICAL_ROOT}/">`,
      `<a href="${BASE_PATH}/getting-started/">start</a>`,
    ].join(''),
    '_next/static/site.css': `a{background:url(${BASE_PATH}/logo/gqty.svg)}`,
    'getting-started/index.html': `<a href="${BASE_PATH}/">home</a>`,
    'logo/gqty.svg': '<svg/>',
  });

  try {
    const failures = (await checkExport(dir)).filter(
      (failure) => !failure.startsWith('missing expected route:')
    );
    assert.deepEqual(failures, []);
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
  const dir = await makeExport({
    'index.html': '<a href="https://gqty.dev/">docs</a>',
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

test('documentation prose about GraphQL and SSR is not treated as a runtime failure', async () => {
  const dir = await makeExport({
    'index.html': [
      '<p>Use <code>getStaticProps</code> for SSR with GraphQL, or <code>useRouter</code>.</p>',
      `<a href="https://stackblitz.com/edit/nextjs-2jqmx4">playground</a>`,
    ].join(''),
  });

  try {
    const failures = (await checkExport(dir)).filter(
      (failure) => !failure.startsWith('missing expected route:')
    );
    assert.deepEqual(failures, []);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
