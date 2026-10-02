import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

/**
 * The contributors section must not present a curated cast.
 *
 * The original component fetched collaborators from the GitHub GraphQL API at
 * build time, so no fixed list of names or avatars was ever part of the source.
 * A hard-coded four-person list with avatars would be invented attribution, so
 * these checks lock in the honest replacement: keep the heading and the link to
 * the live contributor graph, and render no fabricated people.
 */
const source = await readFile(
  fileURLToPath(new URL('./index.tsx', import.meta.url)),
  'utf8'
);

test('the Contributors heading is rendered', () => {
  assert.match(source, />\s*Contributors\s*</);
});

test('the live GitHub contributor graph is linked', () => {
  assert.match(
    source,
    /href="https:\/\/github\.com\/gqty-dev\/gqty\/graphs\/contributors"/
  );
});

test('no curated avatar list is rendered', () => {
  assert.doesNotMatch(source, /<Member\b/);
  assert.doesNotMatch(source, /from '\.\.\/Member'/);
});

test('no fixed names are hard-coded', () => {
  const curatedNames = [
    'Jack Adams',
    'Micha Mailänder',
    'Carlos Almeida',
    'Alex Garbled',
  ];
  for (const name of curatedNames) {
    assert.doesNotMatch(source, new RegExp(name));
  }
});

test('the section no longer carries contributor props plumbing', () => {
  assert.doesNotMatch(source, /contributorsProp/);
  assert.doesNotMatch(source, /contributors\?:/);
});
