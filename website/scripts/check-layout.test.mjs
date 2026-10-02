import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
  LAYOUT_RULES,
  checkLayout,
  checkLayoutCss,
  extractRules,
} from './check-layout.mjs';

/**
 * A stylesheet that satisfies every rule, matching the shape of the minified
 * export (including the property-merge the minifier performs on `.usp__media`
 * and `.usp__panel`).
 */
const healthyCss = [
  '.roadmap__anchor{position:relative;top:-5rem;display:block;grid-column:1/-1;height:0}',
  '.hero__figure img{max-width:100%;min-width:0;height:auto}',
  '.usp__media,.usp__panel{position:relative;overflow:hidden}',
  '.usp__media{width:100%}',
  '@media (min-width:1024px){.usp__media{flex:2 1 0}}',
].join('');

test('a stylesheet carrying every responsive guard passes', () => {
  assert.deepEqual(checkLayoutCss(healthyCss), []);
});

test('the roadmap anchor losing its grid span is reported', () => {
  const css = healthyCss.replace('grid-column:1/-1;', '');

  const failures = checkLayoutCss(css);
  assert.equal(failures.length, 1);
  assert.match(failures[0], /roadmap heading anchor/);
  assert.match(failures[0], /missing grid-column:1\/-1/);
});

test('hero images losing the ability to shrink is reported', () => {
  const css = healthyCss.replace('min-width:0;', '');

  const failures = checkLayoutCss(css);
  assert.ok(
    failures.some((failure) => failure.includes('missing min-width:0')),
    `expected a min-width failure, got: ${failures.join('; ')}`
  );
});

test('the USP media box losing its clip is reported', () => {
  const css = healthyCss.replace('overflow:hidden', 'overflow:visible');

  const failures = checkLayoutCss(css);
  assert.ok(
    failures.some((failure) => failure.includes('missing overflow:hidden')),
    `expected an overflow failure, got: ${failures.join('; ')}`
  );
});

test('a missing selector is reported once, not per declaration', () => {
  const css = '.hero__figure img{max-width:100%;min-width:0;height:auto}';

  const failures = checkLayoutCss(css);
  assert.equal(
    failures.filter((failure) => failure.includes('no rule for')).length,
    2
  );
});

test('rules nested in media queries are extracted with their own selector', () => {
  // The outer at-rule consumes the query text, so only the inner rules come
  // back. That is what makes a guard inside a breakpoint still checkable.
  const rules = extractRules(
    '@media (min-width:1024px){.a{color:red}.b{top:0}}'
  );

  assert.deepEqual(
    rules.map((rule) => rule.selector),
    ['.a', '.b']
  );
});

test('every rule states the measured failure it prevents', () => {
  for (const rule of LAYOUT_RULES) {
    assert.ok(
      rule.reason.length > 0,
      `${rule.name} must document the failure it guards`
    );
  }
});

/** Builds an export directory containing only the stylesheets a test needs. */
async function makeExport(sheets) {
  const dir = await mkdtemp(join(tmpdir(), 'gqty-layout-check-'));
  const cssDir = join(dir, '_next', 'static', 'css');
  await mkdir(cssDir, { recursive: true });

  for (const [name, contents] of Object.entries(sheets)) {
    await writeFile(join(cssDir, name), contents);
  }

  return dir;
}

test('an export whose stylesheet lost a guard fails the check', async () => {
  const dir = await makeExport({
    'site.css': healthyCss.replace('grid-column:1/-1;', ''),
  });

  try {
    const failures = await checkLayout(dir);
    assert.ok(
      failures.some((failure) => failure.includes('grid-column:1/-1')),
      `expected a grid-span failure, got: ${failures.join('; ')}`
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('an export with a healthy stylesheet passes the check', async () => {
  const dir = await makeExport({ 'site.css': healthyCss });

  try {
    assert.deepEqual(await checkLayout(dir), []);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('an export with no stylesheet has no guards to violate', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'gqty-layout-check-'));

  try {
    assert.deepEqual(await checkLayout(dir), []);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
