#!/usr/bin/env node
/**
 * Browser geometry regression for the homepage hero.
 *
 * Run after `pnpm build`. Install Chromium once with
 * `pnpm exec playwright install chromium` before the first local run. By
 * default this script serves the local GitHub Pages export itself. Set
 * HERO_LAYOUT_URL to inspect an already-running readonly preview instead. Set
 * HERO_LAYOUT_ARTIFACT_DIR to retain screenshots and the measured geometry;
 * otherwise temporary screenshots are removed on exit.
 */
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const siteRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const port = Number(process.env.HERO_LAYOUT_PORT ?? 4187);
const localUrl = `http://127.0.0.1:${port}/gqty/`;
const targetUrl = process.env.HERO_LAYOUT_URL ?? localUrl;
const viewports = [
  { width: 1920, height: 1080 },
  { width: 1440, height: 900 },
  { width: 768, height: 1024 },
  { width: 375, height: 812 },
  { width: 320, height: 640 },
];

async function closeServer(server) {
  if (!server || server.exitCode !== null || server.signalCode !== null) return;
  await new Promise((resolveExit) => {
    server.once('exit', resolveExit);
    server.kill('SIGTERM');
  });
}

async function waitForServer(server) {
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`serve-export exited with ${server.exitCode}`);
    }
    try {
      const response = await fetch(localUrl);
      if (response.ok) return;
    } catch {
      // The finite retry waits only for the local static server to bind.
    }
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 100));
  }
  throw new Error('Timed out waiting for serve-export');
}

function approximatelyEqual(actual, expected, label) {
  assert.ok(
    Math.abs(actual - expected) < 0.1,
    `${label}: expected ${expected}, got ${actual}`
  );
}

function expectedGeometry(clientWidth, gutter) {
  const shellWidth = Math.min(clientWidth, 1270);
  const shellX = (clientWidth - shellWidth) / 2;
  const contentX = Math.max(gutter, (clientWidth - 1270) / 2 + gutter);
  return {
    contentWidth: clientWidth - contentX * 2,
    contentX,
    shellWidth,
    shellX,
  };
}

async function measure(page, viewport, reserveScrollbar) {
  await page.setViewportSize(viewport);
  await page.goto(targetUrl, { waitUntil: 'networkidle' });
  if (reserveScrollbar) {
    await page.addStyleTag({ content: 'html { scrollbar-gutter: stable; }' });
  }

  return page.evaluate(() => {
    const rect = (selector) => {
      const element = document.querySelector(selector);
      if (!element) throw new Error(`Missing ${selector}`);
      const box = element.getBoundingClientRect();
      return {
        bottom: box.bottom,
        height: box.height,
        left: box.left,
        right: box.right,
        top: box.top,
        width: box.width,
      };
    };
    const desktopFigure = document.querySelector('.hero__figure--desktop');
    const figure =
      getComputedStyle(desktopFigure).display === 'none'
        ? document.querySelector('.hero__figure--mobile')
        : desktopFigure;
    const after = getComputedStyle(figure, '::after');
    const root = document.documentElement;
    const gutter = Number.parseFloat(
      getComputedStyle(document.querySelector('.stack')).paddingLeft
    );

    return {
      after: {
        insetInlineEnd: after.insetInlineEnd,
        insetInlineStart: after.insetInlineStart,
        width: Number.parseFloat(after.width),
      },
      bodyScrollWidth: document.body.scrollWidth,
      clientWidth: root.clientWidth,
      figure: (() => {
        const box = figure.getBoundingClientRect();
        return {
          bottom: box.bottom,
          height: box.height,
          left: box.left,
          right: box.right,
          top: box.top,
          width: box.width,
        };
      })(),
      firstImage: (() => {
        const box = figure.querySelector('img').getBoundingClientRect();
        return {
          bottom: box.bottom,
          height: box.height,
          left: box.left,
          right: box.right,
          top: box.top,
          width: box.width,
        };
      })(),
      gutter,
      headline: rect('.hero__headline'),
      hero: rect('.hero'),
      heroHeading: rect('.hero__headline h1'),
      lowerStack: rect('.stack'),
      scrollWidth: root.scrollWidth,
      scrollbarGutter: getComputedStyle(root).scrollbarGutter,
      viewport: { height: window.innerHeight, width: window.innerWidth },
    };
  });
}

function assertGeometry(result, label, reserveScrollbar) {
  const expected = expectedGeometry(result.clientWidth, result.gutter);

  if (reserveScrollbar) {
    assert.equal(
      result.scrollbarGutter,
      'stable',
      `${label}: reserved-scrollbar scenario was not applied`
    );
  }

  assert.equal(
    result.scrollWidth,
    result.clientWidth,
    `${label}: document has horizontal overflow`
  );
  assert.equal(
    result.bodyScrollWidth,
    result.clientWidth,
    `${label}: body has horizontal overflow`
  );

  for (const [name, box] of Object.entries({
    hero: result.hero,
    headline: result.headline,
    figure: result.figure,
  })) {
    approximatelyEqual(
      box.left,
      0,
      `${label}: ${name} starts at viewport edge`
    );
    approximatelyEqual(
      box.width,
      result.clientWidth,
      `${label}: ${name} paints across available width`
    );
  }

  approximatelyEqual(
    result.after.width,
    result.figure.width,
    `${label}: figure gradient spans the figure`
  );
  assert.equal(
    result.after.insetInlineStart,
    '0px',
    `${label}: figure gradient starts at the figure edge`
  );
  assert.equal(
    result.after.insetInlineEnd,
    '0px',
    `${label}: figure gradient ends at the figure edge`
  );

  approximatelyEqual(
    result.lowerStack.left,
    expected.shellX,
    `${label}: lower stack remains centered`
  );
  approximatelyEqual(
    result.lowerStack.width,
    expected.shellWidth,
    `${label}: lower stack remains container-bounded`
  );

  approximatelyEqual(
    result.lowerStack.left + result.gutter,
    expected.contentX,
    `${label}: lower stack keeps the former content start`
  );
  approximatelyEqual(
    result.lowerStack.width - result.gutter * 2,
    expected.contentWidth,
    `${label}: lower stack keeps the former content width`
  );

  assert.ok(
    result.heroHeading.left >= expected.contentX &&
      result.heroHeading.right <= expected.contentX + expected.contentWidth,
    `${label}: hero heading escaped its previous content measure`
  );
  assert.ok(
    result.firstImage.left >= expected.contentX &&
      result.firstImage.right <= expected.contentX + expected.contentWidth,
    `${label}: hero image escaped its previous content measure`
  );
}

const artifactDirectory = process.env.HERO_LAYOUT_ARTIFACT_DIR
  ? resolve(process.env.HERO_LAYOUT_ARTIFACT_DIR)
  : await mkdtemp(join(tmpdir(), 'gqty-hero-layout-'));
const keepArtifacts = Boolean(process.env.HERO_LAYOUT_ARTIFACT_DIR);
let server;
let browser;

try {
  await mkdir(artifactDirectory, { recursive: true });
  if (!process.env.HERO_LAYOUT_URL) {
    server = spawn(process.execPath, ['scripts/serve-export.mjs'], {
      cwd: siteRoot,
      env: { ...process.env, PORT: String(port) },
      stdio: 'inherit',
    });
    await waitForServer(server);
  }

  browser = await chromium.launch();
  const context = await browser.newContext({ deviceScaleFactor: 1 });
  const page = await context.newPage();
  const results = [];

  for (const reserveScrollbar of [false, true]) {
    for (const viewport of viewports) {
      const result = await measure(page, viewport, reserveScrollbar);
      const label = `${viewport.width}px ${reserveScrollbar ? 'reserved-scrollbar' : 'default'}`;
      assertGeometry(result, label, reserveScrollbar);
      results.push({ label, ...result });
      await page.screenshot({
        path: join(
          artifactDirectory,
          `hero-${viewport.width}-${reserveScrollbar ? 'reserved-scrollbar' : 'default'}.png`
        ),
      });
    }
  }

  await writeFile(
    join(artifactDirectory, 'geometry.json'),
    `${JSON.stringify({ targetUrl, results }, null, 2)}\n`
  );
  console.log(`Hero geometry passed: ${artifactDirectory}`);
  await context.close();
} finally {
  await browser?.close();
  await closeServer(server);
  if (!keepArtifacts)
    await rm(artifactDirectory, { recursive: true, force: true });
}
