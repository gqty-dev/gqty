// Native Node tests for the canary eligibility classifier.
// Run: node --test scripts/canary-eligibility.test.mjs

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import {
  classifyPaths,
  classifyFileRecord,
  isDocPath,
  isHomepageOnlyPackageManifest,
  runCli,
} from './canary-eligibility.mjs';

const CLI = join(
  dirname(fileURLToPath(import.meta.url)),
  'canary-eligibility.mjs'
);

function record(status, path, extra = {}) {
  return { status, path, ...extra };
}

/** Classify a list of {status,path} records as a full diff. */
function eligible(records, { baseTrees = {}, headTrees = {} } = {}) {
  return classifyPaths(records, { baseTrees, headTrees });
}

// ---------------------------------------------------------------------------
// Documentation / automation exceptions -> non-publish
// ---------------------------------------------------------------------------

test('website and docs trees are non-publish', () => {
  assert.equal(eligible([record('M', 'website/package.json')]).eligible, false);
  assert.equal(
    eligible([record('A', 'website/pages/index.mdx')]).eligible,
    false
  );
  assert.equal(eligible([record('M', 'docs/CoreDesign.md')]).eligible, false);
});

test('root README and CONTRIBUTING are non-publish', () => {
  assert.equal(eligible([record('M', 'README.md')]).eligible, false);
  assert.equal(eligible([record('M', 'CONTRIBUTING.md')]).eligible, false);
});

test('package README and CHANGELOG are non-publish', () => {
  assert.equal(
    eligible([record('M', 'packages/gqty/README.md')]).eligible,
    false
  );
  assert.equal(
    eligible([record('M', 'packages/gqty/CHANGELOG.md')]).eligible,
    false
  );
  assert.equal(
    eligible([record('M', 'packages/react/README.md')]).eligible,
    false
  );
});

test('.changeset/README.md is non-publish but release notes are publish', () => {
  assert.equal(eligible([record('M', '.changeset/README.md')]).eligible, false);
  assert.equal(
    eligible([record('A', '.changeset/large-socks-slide.md')]).eligible,
    true
  );
  assert.equal(
    eligible([record('M', '.changeset/config.json')]).eligible,
    true
  );
});

test('exact automation workflow files are non-publish', () => {
  for (const f of ['canary', 'pages', 'release', 'tests']) {
    assert.equal(
      eligible([record('M', `.github/workflows/${f}.yaml`)]).eligible,
      false,
      f
    );
  }
});

test('near-miss workflow names are publish-relevant', () => {
  for (const f of [
    '.github/workflows/canary.yml',
    '.github/workflows/canary-pages.yaml',
    '.github/workflows/canary-x.yaml',
    '.github/workflows/canary.yaml.bak',
    '.github/workflows/Canary.yaml',
  ]) {
    assert.equal(eligible([record('M', f)]).eligible, true, f);
  }
});

test('classifier and test script files are non-publish', () => {
  assert.equal(
    eligible([record('A', 'scripts/canary-eligibility.mjs')]).eligible,
    false
  );
  assert.equal(
    eligible([record('A', 'scripts/canary-eligibility.test.mjs')]).eligible,
    false
  );
});

// ---------------------------------------------------------------------------
// Homepage-only package manifest exception
// ---------------------------------------------------------------------------

const BASE_PKG = {
  name: 'gqty',
  version: '3.6.0',
  description: 'The No-GraphQL Client for TypeScript',
  homepage: 'https://gqty.dev',
  repository: { type: 'git', url: 'https://github.com/gqty-dev/gqty.git' },
  scripts: { build: 'bob build' },
  dependencies: { graphql: '^16.0.0' },
};

const HOME_PKG = { ...BASE_PKG, homepage: 'https://gqty-dev.github.io/gqty/' };

test('homepage-only change on existing manifest is non-publish', () => {
  const baseTrees = {
    'packages/gqty/package.json': JSON.stringify(BASE_PKG, null, 2),
  };
  const headTrees = {
    'packages/gqty/package.json': JSON.stringify(HOME_PKG, null, 2),
  };
  assert.equal(
    eligible([record('M', 'packages/gqty/package.json')], {
      baseTrees,
      headTrees,
    }).eligible,
    false
  );
});

test('homepage-only across the six existing package manifests is non-publish', () => {
  const manifests = [
    'packages/cli/package.json',
    'packages/gqty/package.json',
    'packages/logger/package.json',
    'packages/react/package.json',
    'packages/solid/package.json',
    'packages/subscriptions/package.json',
  ];
  const records = [];
  const baseTrees = {};
  const headTrees = {};
  for (const m of manifests) {
    records.push(record('M', m));
    baseTrees[m] = JSON.stringify(BASE_PKG, null, 2);
    headTrees[m] = JSON.stringify(HOME_PKG, null, 2);
  }
  assert.equal(eligible(records, { baseTrees, headTrees }).eligible, false);
});

test('homepage plus version change is publish-relevant', () => {
  const baseTrees = {
    'packages/gqty/package.json': JSON.stringify(BASE_PKG, null, 2),
  };
  const headTrees = {
    'packages/gqty/package.json': JSON.stringify(
      { ...HOME_PKG, version: '3.6.1' },
      null,
      2
    ),
  };
  assert.equal(
    eligible([record('M', 'packages/gqty/package.json')], {
      baseTrees,
      headTrees,
    }).eligible,
    true
  );
});

test('homepage plus dependency change is publish-relevant', () => {
  const baseTrees = {
    'packages/gqty/package.json': JSON.stringify(BASE_PKG, null, 2),
  };
  const headTrees = {
    'packages/gqty/package.json': JSON.stringify(
      { ...HOME_PKG, dependencies: { graphql: '^17.0.0' } },
      null,
      2
    ),
  };
  assert.equal(
    eligible([record('M', 'packages/gqty/package.json')], {
      baseTrees,
      headTrees,
    }).eligible,
    true
  );
});

test('homepage plus script change is publish-relevant', () => {
  const baseTrees = {
    'packages/gqty/package.json': JSON.stringify(BASE_PKG, null, 2),
  };
  const headTrees = {
    'packages/gqty/package.json': JSON.stringify(
      { ...HOME_PKG, scripts: { build: 'bob build --x' } },
      null,
      2
    ),
  };
  assert.equal(
    eligible([record('M', 'packages/gqty/package.json')], {
      baseTrees,
      headTrees,
    }).eligible,
    true
  );
});

test('malformed manifest JSON is publish-relevant (fail closed)', () => {
  const baseTrees = {
    'packages/gqty/package.json': JSON.stringify(BASE_PKG, null, 2),
  };
  const headTrees = { 'packages/gqty/package.json': '{ "homepage": "x", ' };
  assert.equal(
    eligible([record('M', 'packages/gqty/package.json')], {
      baseTrees,
      headTrees,
    }).eligible,
    true
  );
});

test('malformed base manifest JSON is publish-relevant', () => {
  const baseTrees = { 'packages/gqty/package.json': 'not json' };
  const headTrees = {
    'packages/gqty/package.json': JSON.stringify(HOME_PKG, null, 2),
  };
  assert.equal(
    eligible([record('M', 'packages/gqty/package.json')], {
      baseTrees,
      headTrees,
    }).eligible,
    true
  );
});

test('added package manifest is publish-relevant even if homepage-only by content', () => {
  const headTrees = {
    'packages/new/package.json': JSON.stringify(HOME_PKG, null, 2),
  };
  assert.equal(
    eligible([record('A', 'packages/new/package.json')], { headTrees })
      .eligible,
    true
  );
});

test('deleted package manifest is publish-relevant', () => {
  const baseTrees = {
    'packages/gqty/package.json': JSON.stringify(BASE_PKG, null, 2),
  };
  assert.equal(
    eligible([record('D', 'packages/gqty/package.json')], { baseTrees })
      .eligible,
    true
  );
});

test('unknown (non-existent in base) manifest is publish-relevant', () => {
  // no baseTree entry for a modified manifest => cannot prove homepage-only
  const headTrees = {
    'packages/gqty/package.json': JSON.stringify(HOME_PKG, null, 2),
  };
  assert.equal(
    eligible([record('M', 'packages/gqty/package.json')], { headTrees })
      .eligible,
    true
  );
});

test('homepage key missing on either side is publish-relevant', () => {
  const baseTrees = {
    'packages/x/package.json': JSON.stringify({
      ...BASE_PKG,
      homepage: undefined,
    }),
  };
  const headTrees = { 'packages/x/package.json': JSON.stringify(HOME_PKG) };
  assert.equal(
    eligible([record('M', 'packages/x/package.json')], { baseTrees, headTrees })
      .eligible,
    true
  );
});

test('nested manifest (website/package.json) is non-publish via website rule', () => {
  assert.equal(eligible([record('A', 'website/package.json')]).eligible, false);
});

// ---------------------------------------------------------------------------
// Real changes -> publish-relevant
// ---------------------------------------------------------------------------

test('package source, config, lockfile, root manifest are publish-relevant', () => {
  const cases = [
    'packages/gqty/src/index.ts',
    'packages/react/src/query/useQuery.ts',
    'package.json',
    'pnpm-lock.yaml',
    'pnpm-workspace.yaml',
    'turbo.json',
    'tsconfig.json',
    '.github/workflows/other.yaml',
    'internal/test-utils/index.ts',
    'examples/react/src/main.tsx',
    '.npmrc',
    'scripts/test-esm.mjs',
  ];
  for (const p of cases) {
    assert.equal(eligible([record('M', p)]).eligible, true, p);
  }
});

test('mixed docs plus source is publish-relevant', () => {
  assert.equal(
    eligible([
      record('M', 'README.md'),
      record('M', 'packages/gqty/src/index.ts'),
    ]).eligible,
    true
  );
});

test('docs plus homepage-only manifest is non-publish', () => {
  const baseTrees = {
    'packages/gqty/package.json': JSON.stringify(BASE_PKG, null, 2),
  };
  const headTrees = {
    'packages/gqty/package.json': JSON.stringify(HOME_PKG, null, 2),
  };
  assert.equal(
    eligible(
      [
        record('M', 'README.md'),
        record('M', 'website/pages/index.mdx'),
        record('M', 'packages/gqty/package.json'),
      ],
      { baseTrees, headTrees }
    ).eligible,
    false
  );
});

// ---------------------------------------------------------------------------
// Rename handling
// ---------------------------------------------------------------------------

test('code -> doc rename still classifies via the code path', () => {
  // git records R with new path doc; old path is code. Must be publish-relevant.
  assert.equal(
    eligible([
      {
        status: 'R100',
        path: 'website/x.mdx',
        oldPath: 'packages/gqty/src/x.ts',
      },
    ]).eligible,
    true
  );
});

test('doc -> code rename is publish-relevant', () => {
  assert.equal(
    eligible([
      {
        status: 'R90',
        path: 'packages/gqty/src/x.ts',
        oldPath: 'website/x.mdx',
      },
    ]).eligible,
    true
  );
});

test('doc -> doc rename is non-publish', () => {
  assert.equal(
    eligible([
      { status: 'R95', path: 'website/y.mdx', oldPath: 'website/x.mdx' },
    ]).eligible,
    false
  );
});

test('rename from a homepage-only manifest to a doc path is publish-relevant', () => {
  const baseTrees = {
    'packages/gqty/package.json': JSON.stringify(BASE_PKG, null, 2),
  };
  const headTrees = {
    'packages/gqty/package.json': JSON.stringify(HOME_PKG, null, 2),
  };
  assert.equal(
    eligible(
      [
        {
          status: 'R100',
          path: 'docs/package.json.bak',
          oldPath: 'packages/gqty/package.json',
        },
      ],
      {
        baseTrees,
        headTrees,
      }
    ).eligible,
    true
  );
});

test('copy status is treated conservatively', () => {
  assert.equal(
    eligible([
      record('C90', 'website/copy.mdx', { oldPath: 'packages/gqty/src/x.ts' }),
    ]).eligible,
    true
  );
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

test('classifyFileRecord throws acceptable shape for unknown status', () => {
  assert.throws(() => classifyFileRecord(record('X', 'a.ts')), /unknown/);
});

test('isDocPath / isHomepageOnlyPackageManifest helpers behave', () => {
  assert.equal(isDocPath('README.md'), true);
  assert.equal(isDocPath('packages/gqty/README.md'), true);
  assert.equal(isDocPath('packages/gqty/src/a.ts'), false);
  assert.equal(
    isHomepageOnlyPackageManifest(
      JSON.stringify(BASE_PKG),
      JSON.stringify(HOME_PKG)
    ),
    true
  );
  assert.equal(
    isHomepageOnlyPackageManifest(
      JSON.stringify(BASE_PKG),
      JSON.stringify({ ...HOME_PKG, version: '9' })
    ),
    false
  );
});

// ---------------------------------------------------------------------------
// CLI integration via temporary Git repositories
// ---------------------------------------------------------------------------

function git(cwd, args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' });
}

function makeRepo() {
  const dir = mkdtempSync(join(tmpdir(), 'canary-elig-'));
  git(dir, ['init', '-q', '-b', 'main']);
  git(dir, ['config', 'user.email', 't@t.t']);
  git(dir, ['config', 'user.name', 't']);
  git(dir, ['config', 'commit.gpgsign', 'false']);
  return dir;
}

function commitFile(dir, path, content, message) {
  const full = join(dir, path);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, content);
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-q', '-m', message]);
  return git(dir, ['rev-parse', 'HEAD']).trim();
}

function runCliIn(dir, args, env = {}) {
  try {
    const stdout = execFileSync(process.execPath, [CLI, ...args], {
      cwd: dir,
      encoding: 'utf8',
      env: { ...process.env, ...env },
    });
    return { code: 0, stdout };
  } catch (err) {
    return {
      code: err.status ?? 1,
      stdout: err.stdout ?? '',
      stderr: err.stderr ?? '',
    };
  }
}

/** Read a GITHUB_OUTPUT-style key from an output file's contents. */
function readOutput(file, key) {
  const text = readFileSync(file, 'utf8');
  const line = text.split('\n').find((l) => l.startsWith(`${key}=`));
  return line === undefined ? undefined : line.slice(key.length + 1);
}

test('CLI: docs-only diff reports eligible=false', () => {
  const dir = makeRepo();
  try {
    const base = commitFile(dir, 'README.md', 'a\n', 'init');
    const head = commitFile(dir, 'README.md', 'b\n', 'docs');
    const res = runCliIn(dir, ['--base', base, '--head', head]);
    assert.equal(res.code, 0, res.stderr);
    assert.match(res.stdout, /eligible=false/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('CLI: code diff reports eligible=true', () => {
  const dir = makeRepo();
  try {
    const base = commitFile(dir, 'README.md', 'a\n', 'init');
    const head = commitFile(dir, 'packages/gqty/src/index.ts', 'x\n', 'code');
    const res = runCliIn(dir, ['--base', base, '--head', head]);
    assert.equal(res.code, 0, res.stderr);
    assert.match(res.stdout, /eligible=true/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('CLI: homepage-only manifest change reports eligible=false', () => {
  const dir = makeRepo();
  try {
    const base = commitFile(
      dir,
      'packages/gqty/package.json',
      JSON.stringify(BASE_PKG, null, 2) + '\n',
      'init'
    );
    const head = commitFile(
      dir,
      'packages/gqty/package.json',
      JSON.stringify(HOME_PKG, null, 2) + '\n',
      'homepage'
    );
    const res = runCliIn(dir, ['--base', base, '--head', head]);
    assert.equal(res.code, 0, res.stderr);
    assert.match(res.stdout, /eligible=false/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('CLI: homepage plus version change reports eligible=true', () => {
  const dir = makeRepo();
  try {
    const base = commitFile(
      dir,
      'packages/gqty/package.json',
      JSON.stringify(BASE_PKG, null, 2) + '\n',
      'init'
    );
    const head = commitFile(
      dir,
      'packages/gqty/package.json',
      JSON.stringify({ ...HOME_PKG, version: '3.6.1' }, null, 2) + '\n',
      'homepage+version'
    );
    const res = runCliIn(dir, ['--base', base, '--head', head]);
    assert.equal(res.code, 0, res.stderr);
    assert.match(res.stdout, /eligible=true/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('CLI: missing ref exits nonzero (never false)', () => {
  const dir = makeRepo();
  try {
    const base = commitFile(dir, 'README.md', 'a\n', 'init');
    const res = runCliIn(dir, ['--base', base, '--head', '0'.repeat(40)]);
    assert.notEqual(res.code, 0);
    assert.doesNotMatch(res.stdout, /eligible=false/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('CLI: disconnected histories (no merge base) exit nonzero', () => {
  const dir = makeRepo();
  try {
    const base = commitFile(dir, 'README.md', 'a\n', 'init');
    git(dir, ['checkout', '-q', '--orphan', 'other']);
    const head = commitFile(dir, 'README.md', 'b\n', 'orphan');
    const res = runCliIn(dir, ['--base', base, '--head', head]);
    assert.notEqual(res.code, 0);
    assert.doesNotMatch(res.stdout, /eligible=false/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('CLI: checked-out HEAD mismatch exits nonzero', () => {
  const dir = makeRepo();
  try {
    const base = commitFile(dir, 'README.md', 'a\n', 'init');
    commitFile(dir, 'README.md', 'b\n', 'second');
    const res = runCliIn(dir, ['--base', base, '--head', base]);
    assert.notEqual(res.code, 0);
    assert.doesNotMatch(res.stdout, /eligible=false/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('CLI: malformed base/head argument exits nonzero', () => {
  const res = runCliIn(process.cwd(), ['--base', 'nope', '--head', 'nope']);
  assert.notEqual(res.code, 0);
  assert.doesNotMatch(res.stdout, /eligible=false/);
});

test('CLI: doc -> code rename is publish-relevant; code -> doc rename is publish-relevant', () => {
  const dir = makeRepo();
  try {
    const base = commitFile(dir, 'website/page.mdx', 'a\n', 'init-doc');
    mkdirSync(join(dir, 'packages/gqty/src'), { recursive: true });
    git(dir, ['mv', 'website/page.mdx', 'packages/gqty/src/page.ts']);
    git(dir, ['commit', '-q', '-m', 'rename doc->code']);
    const head = git(dir, ['rev-parse', 'HEAD']).trim();
    const res = runCliIn(dir, ['--base', base, '--head', head]);
    assert.equal(res.code, 0, res.stderr);
    assert.match(res.stdout, /eligible=true/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// GITHUB_OUTPUT step-output wiring (defect: CLI only wrote stdout)
// ---------------------------------------------------------------------------

test('CLI: writes eligible=false to GITHUB_OUTPUT for docs-only diff', () => {
  const dir = makeRepo();
  try {
    const base = commitFile(dir, 'README.md', 'a\n', 'init');
    const head = commitFile(dir, 'README.md', 'b\n', 'docs');
    const out = join(dir, 'github-output.txt');
    writeFileSync(out, '');
    const res = runCliIn(dir, ['--base', base, '--head', head], {
      GITHUB_OUTPUT: out,
    });
    assert.equal(res.code, 0, res.stderr);
    assert.equal(readOutput(out, 'eligible'), 'false');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('CLI: writes eligible=true to GITHUB_OUTPUT for a package source change', () => {
  const dir = makeRepo();
  try {
    const base = commitFile(dir, 'README.md', 'a\n', 'init');
    const head = commitFile(dir, 'packages/gqty/src/index.ts', 'x\n', 'code');
    const out = join(dir, 'github-output.txt');
    writeFileSync(out, '');
    const res = runCliIn(dir, ['--base', base, '--head', head], {
      GITHUB_OUTPUT: out,
    });
    assert.equal(res.code, 0, res.stderr);
    assert.equal(readOutput(out, 'eligible'), 'true');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('CLI: appends to an existing GITHUB_OUTPUT file without truncation', () => {
  const dir = makeRepo();
  try {
    const base = commitFile(dir, 'README.md', 'a\n', 'init');
    const head = commitFile(dir, 'README.md', 'b\n', 'docs');
    const out = join(dir, 'github-output.txt');
    writeFileSync(out, 'other=value\n');
    const res = runCliIn(dir, ['--base', base, '--head', head], {
      GITHUB_OUTPUT: out,
    });
    assert.equal(res.code, 0, res.stderr);
    const text = readFileSync(out, 'utf8');
    assert.match(text, /^other=value\n/);
    assert.equal(readOutput(out, 'eligible'), 'false');
    assert.equal(
      text.split('\n').filter((l) => l.startsWith('eligible=')).length,
      1
    );
    assert.ok(text.endsWith('\n'));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('CLI: only the constant eligible key goes to GITHUB_OUTPUT; diagnostics stay on stdout', () => {
  const dir = makeRepo();
  try {
    const base = commitFile(dir, 'README.md', 'a\n', 'init');
    const head = commitFile(dir, 'packages/gqty/src/index.ts', 'x\n', 'code');
    const out = join(dir, 'github-output.txt');
    writeFileSync(out, '');
    const res = runCliIn(dir, ['--base', base, '--head', head], {
      GITHUB_OUTPUT: out,
    });
    assert.equal(res.code, 0, res.stderr);
    const text = readFileSync(out, 'utf8');
    assert.doesNotMatch(text, /reasons=/);
    assert.doesNotMatch(text, /baseSha=/);
    assert.match(res.stdout, /reasons=\[/);
    assert.match(res.stdout, /baseSha=/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('CLI: unwritable GITHUB_OUTPUT path propagates nonzero (never silent skip)', () => {
  const dir = makeRepo();
  try {
    const base = commitFile(dir, 'README.md', 'a\n', 'init');
    const head = commitFile(dir, 'README.md', 'b\n', 'docs');
    const asDir = join(dir, 'output-dir');
    mkdirSync(asDir, { recursive: true });
    const res = runCliIn(dir, ['--base', base, '--head', head], {
      GITHUB_OUTPUT: asDir,
    });
    assert.notEqual(
      res.code,
      0,
      'must not succeed when output cannot be written'
    );
    assert.doesNotMatch(res.stdout, /eligible=false/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('CLI: absent GITHUB_OUTPUT still succeeds and reports on stdout', () => {
  const dir = makeRepo();
  try {
    const base = commitFile(dir, 'README.md', 'a\n', 'init');
    const head = commitFile(dir, 'README.md', 'b\n', 'docs');
    const res = runCliIn(dir, ['--base', base, '--head', head], {
      GITHUB_OUTPUT: '',
    });
    assert.equal(res.code, 0, res.stderr);
    assert.match(res.stdout, /eligible=false/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// canary-policy reporter: exact inline Node policy extracted from the workflow
// ---------------------------------------------------------------------------

const WORKFLOW = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '.github',
  'workflows',
  'canary.yaml'
);

/**
 * Extract the reporter's inline Node heredocs body from canary.yaml and
 * materialise it as a temporary module so the exact shipped policy is
 * exercised (no duplicated copy can drift).
 */
function writeReporterModule() {
  const yaml = readFileSync(WORKFLOW, 'utf8');
  const match = yaml.match(/node <<'NODE'\n([\s\S]*?)\n\s*NODE\n/);
  assert.ok(match, 'reporter inline Node block not found in canary.yaml');
  const dir = mkdtempSync(join(tmpdir(), 'canary-policy-'));
  const file = join(dir, 'reporter.mjs');
  writeFileSync(file, match[1]);
  return { dir, file };
}

function runReporter(env) {
  const { dir, file } = writeReporterModule();
  try {
    const stdout = execFileSync(process.execPath, [file], {
      encoding: 'utf8',
      env: { ...process.env, ...env },
    });
    return { code: 0, stdout };
  } catch (err) {
    return {
      code: err.status ?? 1,
      stdout: err.stdout ?? '',
      stderr: err.stderr ?? '',
    };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const SUCCESS_ENV = {
  ELIGIBLE: 'false',
  DETECTOR_RESULT: 'success',
  RELEASE_RESULT: 'skipped',
  ACTOR: 'someone',
  IS_FORK: 'false',
};

test('reporter: ELIGIBLE empty string is rejected (exit 1, not treated as false)', () => {
  const res = runReporter({ ...SUCCESS_ENV, ELIGIBLE: '' });
  assert.equal(res.code, 1, res.stderr);
  assert.match(res.stderr + res.stdout, /ELIGIBLE/);
});

test('reporter: ELIGIBLE garbage is rejected (exit 1)', () => {
  const res = runReporter({ ...SUCCESS_ENV, ELIGIBLE: 'yes' });
  assert.equal(res.code, 1, res.stderr);
});

test('reporter: ELIGIBLE "TRUE" (wrong case) is rejected', () => {
  const res = runReporter({ ...SUCCESS_ENV, ELIGIBLE: 'TRUE' });
  assert.equal(res.code, 1, res.stderr);
});

test('reporter: missing ELIGIBLE env is rejected', () => {
  const env = { ...SUCCESS_ENV };
  delete env.ELIGIBLE;
  const res = runReporter(env);
  assert.equal(res.code, 1, res.stderr);
});

test('reporter: ELIGIBLE=false with detector success is a clean skip', () => {
  const res = runReporter(SUCCESS_ENV);
  assert.equal(res.code, 0, res.stderr);
  assert.match(res.stdout, /SKIPPED/);
});

test('reporter: ELIGIBLE=true, same-repo, release success => PUBLISHED', () => {
  const res = runReporter({
    ...SUCCESS_ENV,
    ELIGIBLE: 'true',
    RELEASE_RESULT: 'success',
  });
  assert.equal(res.code, 0, res.stderr);
  assert.match(res.stdout, /PUBLISHED/);
});

test('reporter: ELIGIBLE=true, release failure => exit 1', () => {
  const res = runReporter({
    ...SUCCESS_ENV,
    ELIGIBLE: 'true',
    RELEASE_RESULT: 'failure',
  });
  assert.equal(res.code, 1);
});

test('reporter: detector failure => exit 1 regardless of eligibility', () => {
  const res = runReporter({
    ...SUCCESS_ENV,
    ELIGIBLE: 'true',
    DETECTOR_RESULT: 'failure',
    RELEASE_RESULT: 'skipped',
  });
  assert.equal(res.code, 1);
});

test('reporter: excluded actor and fork are clean skips even when eligible', () => {
  const excluded = runReporter({
    ...SUCCESS_ENV,
    ELIGIBLE: 'true',
    ACTOR: 'dependabot[bot]',
    RELEASE_RESULT: 'skipped',
  });
  assert.equal(excluded.code, 0, excluded.stderr);
  assert.match(excluded.stdout, /SKIPPED/);

  const fork = runReporter({
    ...SUCCESS_ENV,
    ELIGIBLE: 'true',
    IS_FORK: 'true',
    RELEASE_RESULT: 'skipped',
  });
  assert.equal(fork.code, 0, fork.stderr);
  assert.match(fork.stdout, /SKIPPED/);
});

// ---------------------------------------------------------------------------
// Workflow structure: permissions + check identity
// ---------------------------------------------------------------------------

test('workflow: no top-level permissions block (would constrain called actions)', () => {
  const yaml = readFileSync(WORKFLOW, 'utf8');
  assert.doesNotMatch(yaml, /^permissions:/m);
});

test('workflow: detector and reporter jobs each keep contents: read', () => {
  const yaml = readFileSync(WORKFLOW, 'utf8');
  const detector = yaml.slice(
    yaml.indexOf('canary-eligibility:'),
    yaml.indexOf('release-canary:')
  );
  const reporter = yaml.slice(yaml.indexOf('canary-policy:'));
  assert.match(detector, /permissions:\s*\n\s*contents: read/);
  assert.match(reporter, /permissions:\s*\n\s*contents: read/);
});

test('workflow: release job keeps its original check identity (no display name)', () => {
  const yaml = readFileSync(WORKFLOW, 'utf8');
  const release = yaml.slice(
    yaml.indexOf('release-canary:'),
    yaml.indexOf('canary-policy:')
  );
  assert.doesNotMatch(release, /^\s{4}name:/m);
});

// ---------------------------------------------------------------------------
// Fail-closed tree reads (defect: gitShow swallowed errors -> eligible=true)
// ---------------------------------------------------------------------------

test('CLI: git show failure while reading manifest trees exits nonzero', () => {
  const dir = makeRepo();
  const wrapperDir = mkdtempSync(join(tmpdir(), 'fake-git-'));
  try {
    const base = commitFile(
      dir,
      'packages/gqty/package.json',
      JSON.stringify(BASE_PKG, null, 2) + '\n',
      'init'
    );
    const head = commitFile(
      dir,
      'packages/gqty/package.json',
      JSON.stringify(HOME_PKG, null, 2) + '\n',
      'homepage'
    );

    // Wrapper: fail `git show` only, pass every other invocation to real git.
    const wrapper = join(wrapperDir, 'git');
    writeFileSync(
      wrapper,
      [
        '#!/bin/sh',
        'case "$1" in',
        '  show) echo "fatal: simulated tree read failure" >&2; exit 128 ;;',
        `  *) exec /usr/bin/git "$@" ;;`,
        'esac',
        '',
      ].join('\n')
    );
    execFileSync('chmod', ['+x', wrapper]);
    // Prepend the wrapper directory so `git` resolves to it.
    const pathEnv = `${wrapperDir}:${process.env.PATH}`;

    const res = runCliIn(dir, ['--base', base, '--head', head], {
      PATH: pathEnv,
      GITHUB_OUTPUT: '',
    });
    assert.notEqual(
      res.code,
      0,
      'tree read failure must be a detector error, not eligible=true'
    );
    assert.doesNotMatch(res.stdout, /eligible=true/);
    assert.doesNotMatch(res.stdout, /eligible=false/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
    rmSync(wrapperDir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// Publication wiring: package source changes must classify as eligible=true
// ---------------------------------------------------------------------------

test('package source source-of-truth fixture is eligible=true', () => {
  // The publish-relevant fixture used by the CLI wiring tests. This proves the
  // publication path is exercised, not only the docs/homepage exceptions.
  const res = eligible([record('M', 'packages/gqty/src/index.ts')]);
  assert.equal(res.eligible, true);
  assert.deepEqual(
    res.reasons.map((r) => r.path),
    ['packages/gqty/src/index.ts']
  );
  assert.equal(res.reasons[0].doc, false);
});
