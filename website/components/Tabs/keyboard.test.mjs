import assert from 'node:assert/strict';
import test from 'node:test';

import { nextTabIndex } from './keyboard.mjs';

test('ArrowRight moves to the next tab', () => {
  assert.equal(nextTabIndex('ArrowRight', 0, 3), 1);
});

test('ArrowRight wraps from the last tab to the first', () => {
  assert.equal(nextTabIndex('ArrowRight', 2, 3), 0);
});

test('ArrowLeft moves to the previous tab', () => {
  assert.equal(nextTabIndex('ArrowLeft', 2, 3), 1);
});

test('ArrowLeft wraps from the first tab to the last', () => {
  assert.equal(nextTabIndex('ArrowLeft', 0, 3), 2);
});

test('Home selects the first tab', () => {
  assert.equal(nextTabIndex('Home', 2, 3), 0);
});

test('End selects the last tab', () => {
  assert.equal(nextTabIndex('End', 0, 3), 2);
});

test('unhandled keys leave the selection alone', () => {
  assert.equal(nextTabIndex('Tab', 1, 3), 1);
  assert.equal(nextTabIndex('a', 1, 3), 1);
});

test('a single tab stays selected for every key', () => {
  for (const key of ['ArrowRight', 'ArrowLeft', 'Home', 'End']) {
    assert.equal(nextTabIndex(key, 0, 1), 0);
  }
});
