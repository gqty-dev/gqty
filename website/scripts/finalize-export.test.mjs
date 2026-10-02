import assert from 'node:assert/strict';
import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
  HEADERS_FILENAME,
  PREVIEW_HEADERS,
  finalizeExport,
  headersContent,
} from './finalize-export.mjs';

const PREVIEW_ORIGIN = 'https://abc123.gqty-preview.pages.dev';

/** An isolated `out/` directory, so no test can touch the real export. */
async function makeOut(files = {}) {
  const dir = join(
    tmpdir(),
    `gqty-finalize-export-${process.pid}-${Math.random().toString(36).slice(2)}`
  );
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });

  for (const [path, contents] of Object.entries(files)) {
    await writeFile(join(dir, path), contents);
  }

  return dir;
}

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

test('preview mode writes an X-Robots-Tag for every path', async () => {
  const dir = await makeOut({ 'index.html': '<html></html>' });

  try {
    const result = await finalizeExport({
      outDir: dir,
      preview: true,
      target: 'cloudflare-preview',
      previewOrigin: PREVIEW_ORIGIN,
    });

    assert.equal(result.headersWritten, true);
    assert.equal(
      await readFile(join(dir, HEADERS_FILENAME), 'utf8'),
      PREVIEW_HEADERS
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('the preview header block is exactly the noindex directive', () => {
  assert.equal(
    JSON.stringify(PREVIEW_HEADERS),
    JSON.stringify('/*\n  X-Robots-Tag: noindex, nofollow\n')
  );
});

test('preview mode removes a stale default-mode export before writing headers', async () => {
  const dir = await makeOut({
    'index.html': '<html></html>',
    _headers: '/*\n  X-Frame-Options: DENY\n',
  });

  try {
    await finalizeExport({
      outDir: dir,
      preview: true,
      target: 'cloudflare-preview',
      previewOrigin: PREVIEW_ORIGIN,
    });

    const headers = await readFile(join(dir, HEADERS_FILENAME), 'utf8');
    assert.ok(!headers.includes('X-Frame-Options'));
    assert.ok(headers.includes('X-Robots-Tag: noindex, nofollow'));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('default mode removes a stale preview _headers from the output', async () => {
  const dir = await makeOut({
    'index.html': '<html></html>',
    _headers: PREVIEW_HEADERS,
  });

  try {
    const result = await finalizeExport({
      outDir: dir,
      preview: false,
      target: 'github-pages',
    });

    assert.equal(result.headersWritten, false);
    assert.equal(result.headersRemoved, true);
    assert.equal(await exists(join(dir, HEADERS_FILENAME)), false);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('default mode leaves a clean export clean', async () => {
  const dir = await makeOut({ 'index.html': '<html></html>' });

  try {
    const result = await finalizeExport({
      outDir: dir,
      preview: false,
      target: 'github-pages',
    });

    assert.equal(result.headersRemoved, false);
    assert.equal(await exists(join(dir, HEADERS_FILENAME)), false);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('the finalizer is idempotent in both modes', async () => {
  const dir = await makeOut({ 'index.html': '<html></html>' });

  try {
    await finalizeExport({
      outDir: dir,
      preview: true,
      target: 'cloudflare-preview',
      previewOrigin: PREVIEW_ORIGIN,
    });
    const first = await readFile(join(dir, HEADERS_FILENAME), 'utf8');
    await finalizeExport({
      outDir: dir,
      preview: true,
      target: 'cloudflare-preview',
      previewOrigin: PREVIEW_ORIGIN,
    });
    assert.equal(await readFile(join(dir, HEADERS_FILENAME), 'utf8'), first);

    await finalizeExport({
      outDir: dir,
      preview: false,
      target: 'github-pages',
    });
    await finalizeExport({
      outDir: dir,
      preview: false,
      target: 'github-pages',
    });
    assert.equal(await exists(join(dir, HEADERS_FILENAME)), false);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('a missing export directory is reported rather than silently creating one', async () => {
  const dir = join(
    tmpdir(),
    `gqty-finalize-export-missing-${process.pid}-${Math.random().toString(36).slice(2)}`
  );
  await rm(dir, { recursive: true, force: true });

  await assert.rejects(
    () =>
      finalizeExport({
        outDir: dir,
        preview: true,
        target: 'cloudflare-preview',
        previewOrigin: PREVIEW_ORIGIN,
      }),
    /does not exist/
  );
});

test('the header block contains no origin, so a preview hostname can never leak into it', () => {
  assert.ok(!PREVIEW_HEADERS.includes('pages.dev'));
  assert.ok(
    !headersContent(PREVIEW_ORIGIN).includes(
      PREVIEW_ORIGIN.replace('https://', '')
    )
  );
});
