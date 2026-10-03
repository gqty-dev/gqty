import assert from 'node:assert/strict';
import test from 'node:test';

import {
  BUILD_TARGET_ENV,
  BUILD_TARGETS,
  CANONICAL_ROOT,
  CLOUDFLARE_PREVIEW_TARGET,
  GITHUB_PAGES_TARGET,
  PREVIEW_ORIGIN_ENV,
  PRODUCTION_BASE_PATH,
  PRODUCTION_ORIGIN,
  resolveBuildTarget,
  siteUrl,
} from '../lib/site-config.mjs';

test('an unset build target keeps the GitHub Pages serving base', () => {
  const resolved = resolveBuildTarget({});

  assert.equal(resolved.target, GITHUB_PAGES_TARGET);
  assert.equal(resolved.basePath, PRODUCTION_BASE_PATH);
  assert.equal(resolved.preview, false);
});

test('an empty or whitespace build target is treated as unset', () => {
  assert.equal(
    resolveBuildTarget({ [BUILD_TARGET_ENV]: '' }).target,
    GITHUB_PAGES_TARGET
  );
  assert.equal(
    resolveBuildTarget({ [BUILD_TARGET_ENV]: '   ' }).target,
    GITHUB_PAGES_TARGET
  );
});

test('the explicit GitHub Pages target serves from /gqty and is indexable', () => {
  const resolved = resolveBuildTarget({
    [BUILD_TARGET_ENV]: GITHUB_PAGES_TARGET,
  });

  assert.equal(resolved.basePath, PRODUCTION_BASE_PATH);
  assert.equal(resolved.preview, false);
});

test('the Cloudflare preview target serves from the origin root and is non-indexable', () => {
  const resolved = resolveBuildTarget({
    [BUILD_TARGET_ENV]: CLOUDFLARE_PREVIEW_TARGET,
    [PREVIEW_ORIGIN_ENV]: 'https://abc123.gqty-preview.pages.dev',
  });

  assert.equal(resolved.basePath, '');
  assert.equal(resolved.preview, true);
});

test('surrounding whitespace in the target and preview origin is tolerated', () => {
  const resolved = resolveBuildTarget({
    [BUILD_TARGET_ENV]: `  ${CLOUDFLARE_PREVIEW_TARGET}  `,
    [PREVIEW_ORIGIN_ENV]: '  https://abc123.gqty-preview.pages.dev  ',
  });

  assert.equal(resolved.target, CLOUDFLARE_PREVIEW_TARGET);
  assert.equal(resolved.previewOrigin, 'https://abc123.gqty-preview.pages.dev');
});

test('an unknown build target is rejected instead of falling back', () => {
  assert.throws(
    () => resolveBuildTarget({ [BUILD_TARGET_ENV]: 'cloudflare-production' }),
    new RegExp(
      `Unsupported ${BUILD_TARGET_ENV}: "cloudflare-production"\\. Expected "${GITHUB_PAGES_TARGET}" or "${CLOUDFLARE_PREVIEW_TARGET}"\\.`
    )
  );
});

test('a near-miss build target is rejected rather than silently defaulted', () => {
  assert.throws(
    () => resolveBuildTarget({ [BUILD_TARGET_ENV]: 'GitHub-Pages' }),
    /Unsupported WEBSITE_BUILD_TARGET/
  );
});

test('an unknown target is rejected even when a preview origin is present', () => {
  assert.throws(
    () =>
      resolveBuildTarget({
        [BUILD_TARGET_ENV]: 'preview',
        [PREVIEW_ORIGIN_ENV]: 'https://abc123.gqty-preview.pages.dev',
      }),
    /Unsupported WEBSITE_BUILD_TARGET/
  );
});

test('an unknown target is ignored by GitHub Pages mode, which needs no origin', () => {
  const resolved = resolveBuildTarget({
    [BUILD_TARGET_ENV]: GITHUB_PAGES_TARGET,
  });

  assert.equal(resolved.previewOrigin, undefined);
});

test('a Cloudflare preview build without CF_PAGES_URL is rejected', () => {
  assert.throws(
    () => resolveBuildTarget({ [BUILD_TARGET_ENV]: CLOUDFLARE_PREVIEW_TARGET }),
    new RegExp(
      `${CLOUDFLARE_PREVIEW_TARGET} builds require ${PREVIEW_ORIGIN_ENV}`
    )
  );
});

test('an empty CF_PAGES_URL is treated as missing', () => {
  assert.throws(
    () =>
      resolveBuildTarget({
        [BUILD_TARGET_ENV]: CLOUDFLARE_PREVIEW_TARGET,
        [PREVIEW_ORIGIN_ENV]: '   ',
      }),
    /require CF_PAGES_URL/
  );
});

test('a plain-HTTP CF_PAGES_URL is rejected', () => {
  assert.throws(
    () =>
      resolveBuildTarget({
        [BUILD_TARGET_ENV]: CLOUDFLARE_PREVIEW_TARGET,
        [PREVIEW_ORIGIN_ENV]: 'http://abc123.gqty-preview.pages.dev',
      }),
    /must be HTTPS/
  );
});

test('a non-URL CF_PAGES_URL is rejected rather than normalized', () => {
  assert.throws(
    () =>
      resolveBuildTarget({
        [BUILD_TARGET_ENV]: CLOUDFLARE_PREVIEW_TARGET,
        [PREVIEW_ORIGIN_ENV]: 'abc123.gqty-preview.pages.dev',
      }),
    /is not a valid URL/
  );
});

test('the canonical namespace never follows the serving base', () => {
  assert.equal(PRODUCTION_ORIGIN, 'https://gqty-dev.github.io');
  assert.equal(CANONICAL_ROOT, 'https://gqty-dev.github.io/gqty');
  assert.equal(BUILD_TARGETS[CLOUDFLARE_PREVIEW_TARGET].basePath, '');
  assert.equal(
    BUILD_TARGETS[GITHUB_PAGES_TARGET].basePath,
    PRODUCTION_BASE_PATH
  );
});

test('site URLs resolve onto the production origin from a root-relative path', () => {
  assert.equal(siteUrl('/'), 'https://gqty-dev.github.io/gqty/');
  assert.equal(
    siteUrl('/guides/react/read/'),
    'https://gqty-dev.github.io/gqty/guides/react/read/'
  );
  assert.equal(
    siteUrl('guides/react/read/'),
    'https://gqty-dev.github.io/gqty/guides/react/read/'
  );
});

test('the resolved target objects are frozen so a caller cannot mutate the contract', () => {
  assert.ok(Object.isFrozen(BUILD_TARGETS));
  assert.ok(Object.isFrozen(BUILD_TARGETS[CLOUDFLARE_PREVIEW_TARGET]));
});
