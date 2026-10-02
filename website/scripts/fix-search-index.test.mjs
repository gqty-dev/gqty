import assert from 'node:assert/strict';
import test from 'node:test';

import { BASE_PATH, prefixSearchIndex } from './fix-search-index.mjs';

test('routes are rewritten under the deployment base path', () => {
  const { data, changed } = prefixSearchIndex({
    '/': { title: 'GQty' },
    '/concepts': { title: 'Concepts' },
  });

  assert.equal(changed, true);
  assert.deepEqual(Object.keys(data), [
    `${BASE_PATH}/`,
    `${BASE_PATH}/concepts`,
  ]);
  assert.deepEqual(data[`${BASE_PATH}/concepts`], { title: 'Concepts' });
});

test('an already prefixed index is left unchanged instead of double-prefixed', () => {
  const input = { [`${BASE_PATH}/concepts`]: { title: 'Concepts' } };
  const { data, changed, alreadyPrefixed } = prefixSearchIndex(input);

  assert.equal(changed, false);
  assert.equal(alreadyPrefixed, 1);
  assert.deepEqual(Object.keys(data), [`${BASE_PATH}/concepts`]);
});
