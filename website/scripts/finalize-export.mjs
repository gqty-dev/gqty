#!/usr/bin/env node
/**
 * Applies (or removes) the hosting-specific files a static export needs after
 * `next build` has written `out/`.
 *
 * Exactly one thing varies by host:
 *
 *   - GitHub Pages (production) serves the export as plain files. It has no
 *     `_headers` support, and a leftover `_headers` in `out/` would be
 *     uploaded as an ordinary asset — so a stale file from a previous preview
 *     build must be deleted, not ignored.
 *   - Cloudflare Pages reads `out/_headers` and applies it to matching paths.
 *     The preview is a public duplicate rendering of the production route
 *     namespace, so every path carries `X-Robots-Tag: noindex, nofollow`.
 *
 * The preview hostname (`CF_PAGES_URL`) deliberately does not appear in any
 * generated file. Canonical metadata names GitHub Pages, and indexing policy
 * is expressed once, by path, for the whole deployment.
 *
 * Nothing here talks to the network or reads a secret.
 */

import { access, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  HEADERS_FILENAME,
  SITE_ROOT,
  resolveBuildTarget,
} from '../lib/site-config.mjs';

export { HEADERS_FILENAME };

/**
 * The complete `_headers` file written for a preview deployment.
 *
 * One rule for every path. The directive is the HTTP-header half of the
 * preview's indexing protection; the `<meta name="robots">` tag on each page
 * is the other half, and both are asserted by `check:export`.
 */
export const PREVIEW_HEADERS = `/*
  X-Robots-Tag: noindex, nofollow
`;

/**
 * The header block for a deployment.
 *
 * `previewOrigin` is accepted for diagnostics only and never serialized: the
 * policy is path-based, so exposing the hostname in a generated file would add
 * no protection while making the file host-specific.
 *
 * @param {string} [previewOrigin]
 */
export function headersContent(previewOrigin) {
  void previewOrigin;
  return PREVIEW_HEADERS;
}

async function exists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Finalizes an export directory for its host.
 *
 * @param {{ outDir: string, preview: boolean, target: string, previewOrigin?: string }} options
 * @returns {Promise<{ headersWritten: boolean, headersRemoved: boolean }>}
 */
export async function finalizeExport({
  outDir,
  preview,
  target,
  previewOrigin,
}) {
  const dirInfo = await stat(outDir).catch(() => undefined);
  if (!dirInfo || !dirInfo.isDirectory()) {
    throw new Error(
      `Cannot finalize export: ${outDir} does not exist. Run the build first.`
    );
  }

  const headersPath = join(outDir, HEADERS_FILENAME);

  if (preview) {
    const contents = headersContent(previewOrigin);
    const existing = await readFile(headersPath, 'utf8').catch(() => undefined);

    if (existing !== contents) {
      await writeFile(headersPath, contents);
    }

    return { headersWritten: true, headersRemoved: false };
  }

  // Production: remove any stale preview policy. `.nojekyll` and the Pages
  // artifact are produced from this same directory, so leaving the file in
  // place would mark the live site non-indexable.
  if (await exists(headersPath)) {
    await rm(headersPath);
    return { headersWritten: false, headersRemoved: true };
  }

  void target;
  return { headersWritten: false, headersRemoved: false };
}

async function main() {
  let mode;
  try {
    mode = resolveBuildTarget();
  } catch (error) {
    console.error(`finalize-export failed: ${error.message}`);
    process.exitCode = 1;
    return;
  }

  const outDir = join(SITE_ROOT, 'out');

  try {
    const result = await finalizeExport({
      outDir,
      preview: mode.preview,
      target: mode.target,
      previewOrigin: mode.previewOrigin,
    });

    if (result.headersWritten) {
      console.log(
        `finalize-export: wrote ${HEADERS_FILENAME} for ${mode.target} (${HEADERS_FILENAME} applies X-Robots-Tag: noindex, nofollow to /*)`
      );
    } else if (result.headersRemoved) {
      console.log(
        `finalize-export: removed stale ${HEADERS_FILENAME} for ${mode.target}`
      );
    } else {
      console.log(`finalize-export: nothing to do for ${mode.target}`);
    }
  } catch (error) {
    console.error(`finalize-export failed: ${error.message}`);
    process.exitCode = 1;
  }
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))
) {
  await main();
}
