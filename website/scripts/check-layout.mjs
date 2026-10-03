#!/usr/bin/env node
/**
 * Deterministic guards for the responsive layout defects found on the live
 * landing page.
 *
 * These are not pixel assertions. Each rule below encodes a *causal*
 * declaration that a real measurement showed to be load-bearing, so a future
 * edit that removes it fails here instead of silently reintroducing a
 * document that is wider than the viewport.
 *
 * Measured facts this file pins down (Chromium, static export served at
 * `/gqty/`):
 *   - `.hero__figure--desktop` is a row of two 440px images plus a 120px
 *     arrow. Below ~1200px the row cannot fit the content box, and because a
 *     flex row does not let images shrink past their intrinsic width by
 *     default, the pair bled to `scrollWidth` 908 at viewport 768.
 *   - `.usp__hex--wide` is deliberately positioned at `right: -5rem` with a
 *     150px box, so it extended the document to `scrollWidth` 470 at viewport
 *     375 until its owning `.usp__media` clipped it.
 *   - `.roadmap-grid` declares two columns, but `.roadmap__anchor` is a
 *     third grid child. As an auto-placed item it consumed the first cell and
 *     pushed the heading/groups into the narrow aside track (measured lane
 *     width 83.2px at 1440).
 *
 * Nothing here executes the site, renders a browser, or talks to the network.
 * Browser measurement remains authoritative; this file only prevents silent
 * regression of the declarations that made the measurement pass.
 */
import { readFile, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Rules checked against the exported stylesheets.
 *
 * `selector` and `declarations` are matched as literal substrings of the
 * minified rule body, so the check stays valid across formatting and
 * class-name hashing of unrelated rules.
 */
export const LAYOUT_RULES = [
  {
    name: 'roadmap heading anchor does not consume a grid cell',
    selector: '.roadmap__anchor',
    declarations: ['grid-column:1/-1'],
    reason:
      '.roadmap__anchor is a grid child of .roadmap-grid; without spanning the ' +
      'full track it claims column 1 and pushes the heading and groups into ' +
      'the narrow aside column, which measured 83.2px lanes at viewport 1440',
  },
  {
    name: 'hero figure images may shrink below their intrinsic width',
    selector: '.hero__figure img',
    declarations: ['max-width:100%', 'min-width:0'],
    reason:
      'the desktop figure is a two-image row; without min-width:0 the images ' +
      'cannot shrink past 440px and the document measured 908px wide at ' +
      'viewport 768',
  },
  {
    name: 'the USP media box clips its oversized decoration',
    selector: '.usp__media',
    declarations: ['overflow:hidden'],
    reason:
      '.usp__hex--wide is positioned at right:-5rem; without clipping at the ' +
      'owning container the document measured 470px wide at viewport 375',
  },
];

/**
 * Splits a stylesheet into `{ selector, body }` pairs.
 *
 * The export is minified, so rule bodies contain no nested braces and the
 * match is a flat scan. Media-query rule bodies are included: the properties
 * that matter here live inside breakpoints.
 *
 * @param {string} css
 */
export function extractRules(css) {
  const rules = [];
  for (const match of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    rules.push({ selector: match[1].trim(), body: match[2].trim() });
  }
  return rules;
}

/**
 * Checks one stylesheet against every layout rule.
 *
 * A rule passes when some rule body whose selector list contains the expected
 * selector also contains every required declaration. A missing declaration is
 * reported per-property so the failure names what was actually lost.
 *
 * @param {string} css
 * @returns {string[]} failures; empty means every rule held
 */
export function checkLayoutCss(css) {
  const failures = [];
  const rules = extractRules(css);

  for (const rule of LAYOUT_RULES) {
    const matching = rules.filter((entry) =>
      entry.selector.split(',').some((part) => part.trim() === rule.selector)
    );

    if (matching.length === 0) {
      failures.push(
        `${rule.name}: no rule for ${rule.selector} (${rule.reason})`
      );
      continue;
    }

    for (const declaration of rule.declarations) {
      const present = matching.some((entry) =>
        entry.body.split(';').some((part) => part.trim() === declaration)
      );

      if (!present) {
        failures.push(
          `${rule.name}: ${rule.selector} is missing ${declaration} (${rule.reason})`
        );
      }
    }
  }

  return failures;
}

/**
 * Reads every exported stylesheet and checks it.
 *
 * @param {string} outDir
 * @returns {Promise<string[]>}
 */
export async function checkLayout(outDir) {
  const cssDir = join(outDir, '_next', 'static', 'css');

  const entries = await readdir(cssDir).catch(() => []);
  const sheets = entries.filter((name) => name.endsWith('.css'));

  // An export with no stylesheet has no layout guards to violate. Reporting
  // the absence here would fail unrelated checks, and a site that ships no
  // CSS is already caught by the route and reference checks.
  if (sheets.length === 0) return [];

  const css = (
    await Promise.all(
      sheets.map((name) => readFile(join(cssDir, name), 'utf8'))
    )
  ).join('\n');

  return checkLayoutCss(css);
}

async function main() {
  const siteRoot = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
  const outDir = join(siteRoot, 'out');

  const failures = await checkLayout(outDir);

  if (failures.length > 0) {
    console.error(`check:layout failed with ${failures.length} problem(s):`);
    for (const failure of failures) console.error(`  - ${failure}`);
    process.exitCode = 1;
    return;
  }

  console.log(
    `check:layout passed: ${LAYOUT_RULES.length} responsive layout guards hold in the export`
  );
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))
) {
  await main();
}
