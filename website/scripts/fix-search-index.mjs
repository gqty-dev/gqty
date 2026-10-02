#!/usr/bin/env node
/**
 * Prefixes the exported Nextra search index with the deployment base path.
 *
 * Nextra 2 renders search hit links straight from the index keys without adding
 * `basePath`, so an unprefixed key navigates to `/concepts` instead of
 * `/gqty/concepts`. The keys are rewritten once, after export, and the check in
 * `check-export.mjs` then verifies every resulting URL resolves.
 *
 * If Nextra ever prefixes those keys itself, the guard below turns this into a
 * no-op instead of producing a double prefix.
 */

import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const BASE_PATH = '/gqty';

export function prefixSearchIndex(data, basePath = BASE_PATH) {
  /** @type {Record<string, unknown>} */
  const result = {};
  let changed = false;
  let alreadyPrefixed = 0;

  for (const [route, value] of Object.entries(data)) {
    if (route === basePath || route.startsWith(`${basePath}/`)) {
      alreadyPrefixed += 1;
      result[route] = value;
      continue;
    }

    const normalized = route === '/' ? `${basePath}/` : `${basePath}${route}`;
    result[normalized] = value;
    changed = true;
  }

  return { data: result, changed, alreadyPrefixed };
}

async function main() {
  const siteRoot = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
  const chunksDir = join(siteRoot, 'out', '_next', 'static', 'chunks');

  const entries = await readdir(chunksDir).catch(() => []);
  const indexFiles = entries.filter(
    (name) => name.startsWith('nextra-data-') && name.endsWith('.json')
  );

  if (indexFiles.length === 0) {
    console.error(
      'fix-search-index: no Nextra search index found in the export.'
    );
    process.exitCode = 1;
    return;
  }

  for (const name of indexFiles) {
    const path = join(chunksDir, name);
    const data = JSON.parse(await readFile(path, 'utf8'));
    const {
      data: prefixed,
      changed,
      alreadyPrefixed,
    } = prefixSearchIndex(data);

    if (!changed) {
      console.log(
        `fix-search-index: ${name} already prefixed (${alreadyPrefixed} routes), nothing to do.`
      );
      continue;
    }

    await writeFile(path, JSON.stringify(prefixed));
    console.log(
      `fix-search-index: prefixed ${Object.keys(prefixed).length} routes in ${name}.`
    );
  }
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))
) {
  await main();
}
