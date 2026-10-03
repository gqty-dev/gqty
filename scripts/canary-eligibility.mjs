#!/usr/bin/env node
// Canary eligibility classifier.
//
// Fail-closed: a commit range is "eligible" for a canary publish whenever any
// changed path is a real code, config, manifest-content, lockfile, or other
// publish-relevant change. "eligible" is true unless we can *prove* that every
// changed path is documentation or automation metadata.
//
// Any unrecognized path, malformed data, or Git/diff/tree-read failure is
// treated as publish relevant (eligible=true), and CLI-level detector errors
// exit nonzero and never degrade to "ineligible".
//
// Exports pure functions for unit tests and a CLI guarded by validateGitDiff.

import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';

const SHA_RE = /^[0-9a-f]{40}$/;

// Exact automation files allowed to change without a publish.
const AUTOMATION_FILES = new Set([
  '.github/workflows/canary.yaml',
  '.github/workflows/pages.yaml',
  '.github/workflows/release.yaml',
  '.github/workflows/tests.yaml',
  'scripts/canary-eligibility.mjs',
  'scripts/canary-eligibility.test.mjs',
]);

// Root documentation files.
const ROOT_DOC_FILES = new Set(['README.md', 'CONTRIBUTING.md']);

/** True for paths that are documentation-only (never publish relevant). */
export function isDocPath(path) {
  if (path.startsWith('website/') || path.startsWith('docs/')) return true;
  if (ROOT_DOC_FILES.has(path)) return true;
  // .changeset/README.md only; every other .changeset/** file is publish relevant.
  if (path === '.changeset/README.md') return true;
  if (/^packages\/[^/]+\/(README|CHANGELOG)\.md$/.test(path)) return true;
  return false;
}

/** True when the changed path is an existing package manifest candidate. */
export function isPackageManifestPath(path) {
  return /^packages\/[^/]+\/package\.json$/.test(path);
}

/**
 * Strict homepage-only check on already-parsed manifests.
 * Requires an own enumerable `homepage` string on both sides and every other
 * value deeply equal. Parsing is done by the caller so malformed JSON stays a
 * caller-visible failure rather than a silent "not homepage-only".
 */
export function isHomepageOnlyManifest(baseJson, headJson) {
  if (typeof baseJson !== 'object' || baseJson === null) return false;
  if (typeof headJson !== 'object' || headJson === null) return false;
  if (!Object.prototype.hasOwnProperty.call(baseJson, 'homepage')) return false;
  if (!Object.prototype.hasOwnProperty.call(headJson, 'homepage')) return false;
  if (
    typeof baseJson.homepage !== 'string' ||
    typeof headJson.homepage !== 'string'
  )
    return false;
  if (baseJson.homepage === headJson.homepage) return false;

  const strip = (obj) => {
    const { homepage, ...rest } = obj;
    return rest;
  };
  return deepEqual(strip(baseJson), strip(headJson));
}

/** Parse-and-check wrapper used by tests and the classifier. */
export function isHomepageOnlyPackageManifest(baseText, headText) {
  let baseJson;
  let headJson;
  try {
    baseJson = JSON.parse(baseText);
  } catch {
    return false;
  }
  try {
    headJson = JSON.parse(headText);
  } catch {
    return false;
  }
  return isHomepageOnlyManifest(baseJson, headJson);
}

/** Structural deep equality over JSON values. */
export function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return false;
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    return a.every((v, i) => deepEqual(v, b[i]));
  }
  if (typeof a !== 'object') return false;
  const ak = Object.keys(a);
  const bk = Object.keys(b);
  if (ak.length !== bk.length) return false;
  return ak.every(
    (k) => Object.prototype.hasOwnProperty.call(b, k) && deepEqual(a[k], b[k])
  );
}

/**
 * Classify a single diff record.
 * record: { status, path, oldPath? }
 * Returns { doc: boolean, reason: string }.
 * Unknown statuses throw so the CLI can exit nonzero (never "ineligible").
 */
export function classifyFileRecord(record) {
  const { status, path, oldPath } = record;
  if (typeof path !== 'string' || path.length === 0) {
    throw new Error('diff record missing path');
  }
  const letter = status.slice(0, 1);

  if (letter === 'R' || letter === 'C') {
    if (typeof oldPath !== 'string' || oldPath.length === 0) {
      throw new Error(`rename/copy record missing old path for ${path}`);
    }
    const newDoc = isDocPath(path) || AUTOMATION_FILES.has(path);
    const oldDoc = isDocPath(oldPath) || AUTOMATION_FILES.has(oldPath);
    // A rename cannot bypass the gate: both paths must be doc/automation.
    const doc = newDoc && oldDoc;
    return {
      doc,
      reason: doc
        ? `rename within doc/automation (${oldPath} -> ${path})`
        : `rename touches publish-relevant path (${oldPath} -> ${path})`,
    };
  }

  if (letter === 'A' || letter === 'D' || letter === 'M') {
    if (isDocPath(path)) return { doc: true, reason: `doc path ${path}` };
    if (AUTOMATION_FILES.has(path))
      return { doc: true, reason: `automation file ${path}` };
    return { doc: false, reason: `publish-relevant path ${path}` };
  }

  throw new Error(`unknown diff status "${status}" for ${path}`);
}

/**
 * Classify a whole diff.
 * records: [{status, path, oldPath?}]
 * trees:   { baseTrees: { [path]: text }, headTrees: { [path]: text } }
 * Returns { eligible, reasons: [{path, reason, doc}] }.
 */
export function classifyPaths(records, trees = {}) {
  const { baseTrees = {}, headTrees = {} } = trees;
  const reasons = [];
  let eligible = false;

  for (const record of records) {
    const { status, path } = record;

    if (isPackageManifestPath(path) && status.slice(0, 1) === 'M') {
      const baseText = baseTrees[path];
      const headText = headTrees[path];
      if (baseText !== undefined && headText !== undefined) {
        if (isHomepageOnlyPackageManifest(baseText, headText)) {
          reasons.push({
            path,
            reason: `homepage-only manifest edit ${path}`,
            doc: true,
          });
          continue;
        }
        reasons.push({
          path,
          reason: `manifest edit beyond homepage ${path}`,
          doc: false,
        });
        eligible = true;
        continue;
      }
      reasons.push({
        path,
        reason: `modified manifest without both base and head content ${path}`,
        doc: false,
      });
      eligible = true;
      continue;
    }

    const { doc, reason } = classifyFileRecord(record);
    reasons.push({ path, reason, doc });
    if (!doc) eligible = true;
  }

  return { eligible, reasons };
}

// ---------------------------------------------------------------------------
// Git-backed CLI
// ---------------------------------------------------------------------------

function gitLines(cwd, args) {
  const out = execFileSync('git', args, { cwd, encoding: 'utf8' });
  return out;
}

function gitShow(cwd, rev, path) {
  // Fail closed: a tree-read failure (missing ref, corrupt object, I/O error)
  // must surface as a detector error, not silently degrade to "no content",
  // which the classifier would read as a publish-relevant manifest change.
  return execFileSync('git', ['show', `${rev}:${path}`], {
    cwd,
    encoding: 'utf8',
  });
}

/**
 * Paths whose manifest *contents* must be read to prove homepage-only.
 * Only existing, modified package manifests qualify: added/deleted/renamed
 * records already classify as eligible=true without any content read.
 */
export function manifestPathsNeedingContent(records) {
  const paths = new Set();
  for (const record of records) {
    if (
      record.status.slice(0, 1) === 'M' &&
      isPackageManifestPath(record.path)
    ) {
      paths.add(record.path);
    }
  }
  return paths;
}

/**
 * Parse `git diff --name-status -z --find-renames <base> <head>`.
 * NUL-terminated fields; rename/copy records have status, old, new.
 * Throws on any malformed record.
 */
export function parseNameStatusZ(raw) {
  const fields = raw.split('\0');
  // trailing empty field after the final NUL
  if (fields.length && fields[fields.length - 1] === '') fields.pop();
  const records = [];
  for (let i = 0; i < fields.length; i++) {
    const status = fields[i];
    if (!status) throw new Error('malformed diff record: empty status');
    const letter = status.slice(0, 1);
    if (!/^[A-Z]/.test(letter))
      throw new Error(`malformed diff status "${status}"`);
    if (letter === 'R' || letter === 'C') {
      const oldPath = fields[++i];
      const path = fields[++i];
      if (oldPath === undefined || path === undefined || !oldPath || !path) {
        throw new Error(`malformed rename/copy record for status "${status}"`);
      }
      records.push({ status, oldPath, path });
    } else {
      const path = fields[++i];
      if (path === undefined || !path) {
        throw new Error(`malformed diff record for status "${status}"`);
      }
      records.push({ status, path });
    }
  }
  return records;
}

/** Validate SHAs, merge base, HEAD equality, and produce diff records. */
export function validateGitDiff({ base, head, cwd = process.cwd() }) {
  if (typeof base !== 'string' || !SHA_RE.test(base)) {
    throw new Error(`invalid --base SHA: ${JSON.stringify(base)}`);
  }
  if (typeof head !== 'string' || !SHA_RE.test(head)) {
    throw new Error(`invalid --head SHA: ${JSON.stringify(head)}`);
  }

  const resolve = (rev) =>
    gitLines(cwd, ['rev-parse', '--verify', `${rev}^{commit}`]).trim();
  const baseSha = resolve(base);
  const headSha = resolve(head);

  const currentHead = gitLines(cwd, ['rev-parse', 'HEAD']).trim();
  if (currentHead !== headSha) {
    throw new Error(
      `checked-out HEAD ${currentHead} does not match --head ${headSha}`
    );
  }

  let mergeBase;
  try {
    mergeBase = execFileSync('git', ['merge-base', baseSha, headSha], {
      cwd,
      encoding: 'utf8',
    }).trim();
  } catch {
    throw new Error(`no merge base between ${baseSha} and ${headSha}`);
  }
  if (!SHA_RE.test(mergeBase)) {
    throw new Error(`unresolved merge base for ${baseSha}..${headSha}`);
  }

  const raw = gitLines(cwd, [
    'diff',
    '--name-status',
    '-z',
    '--find-renames',
    mergeBase,
    headSha,
  ]);
  const records = parseNameStatusZ(raw);

  const baseTrees = {};
  const headTrees = {};
  for (const path of manifestPathsNeedingContent(records)) {
    headTrees[path] = gitShow(cwd, headSha, path);
    // Base content is taken from the merge base; only needed for modified manifests.
    baseTrees[path] = gitShow(cwd, mergeBase, path);
  }

  return { baseSha, headSha, mergeBase, records, baseTrees, headTrees };
}

/** GitHub-output-safe key=value escaping for a single line value. */
function ghEscape(value) {
  return String(value)
    .replace(/%/g, '%25')
    .replace(/\r/g, '%0D')
    .replace(/\n/g, '%0A');
}

function writeOutput(lines, key, value) {
  lines.push(`${key}=${ghEscape(value)}`);
}

export function runCli(
  argv,
  {
    cwd = process.cwd(),
    stdout = process.stdout,
    stderr = process.stderr,
    env = process.env,
    appendOutput = appendFileSync,
  } = {}
) {
  let base;
  let head;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--base') base = argv[++i];
    else if (argv[i] === '--head') head = argv[++i];
    else throw new Error(`unknown argument ${JSON.stringify(argv[i])}`);
  }
  if (!base || !head)
    throw new Error('usage: canary-eligibility.mjs --base <sha> --head <sha>');

  const { baseSha, headSha, mergeBase, records, baseTrees, headTrees } =
    validateGitDiff({
      base,
      head,
      cwd,
    });
  const { eligible, reasons } = classifyPaths(records, {
    baseTrees,
    headTrees,
  });

  const lines = [];
  writeOutput(lines, 'eligible', eligible ? 'true' : 'false');
  writeOutput(lines, 'baseSha', baseSha);
  writeOutput(lines, 'headSha', headSha);
  writeOutput(lines, 'mergeBase', mergeBase);
  writeOutput(lines, 'changedCount', String(records.length));
  writeOutput(lines, 'reasons', JSON.stringify(reasons));

  // Step-output wiring: GitHub Actions only sees job outputs that the step
  // writes to $GITHUB_OUTPUT. Only the constant-valued `eligible` field is
  // emitted; diagnostic detail stays on stdout so a huge `reasons` payload
  // never has to fit in the output file. I/O failures propagate (nonzero) so a
  // broken output path can never silently become "no publish". Written before
  // stdout so a failed output write cannot be mistaken for a clean run.
  const outputPath = env.GITHUB_OUTPUT;
  if (typeof outputPath === 'string' && outputPath.length > 0) {
    appendOutput(outputPath, `eligible=${eligible ? 'true' : 'false'}\n`);
  }

  stdout.write(lines.join('\n') + '\n');

  return { eligible, reasons };
}

const isMain =
  process.argv[1] &&
  import.meta.url === new URL(`file://${process.argv[1]}`).href;

if (isMain) {
  try {
    runCli(process.argv.slice(2));
  } catch (err) {
    process.stderr.write(
      `canary-eligibility: ${err && err.message ? err.message : err}\n`
    );
    process.exit(1);
  }
}
