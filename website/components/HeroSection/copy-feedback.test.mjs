import assert from 'node:assert/strict';
import test from 'node:test';

import { COPY_FEEDBACK_MS, copyFeedbackReducer } from './copy-feedback.mjs';

test('a resolved copy shows success feedback', () => {
  const state = copyFeedbackReducer(
    { status: 'idle' },
    {
      type: 'copy-settled',
      ok: true,
    }
  );
  assert.equal(state.status, 'copied');
});

test('a rejected copy shows failure feedback instead of success', () => {
  const state = copyFeedbackReducer(
    { status: 'idle' },
    {
      type: 'copy-settled',
      ok: false,
    }
  );
  assert.equal(state.status, 'failed');
});

test('feedback clears so a repeated copy can announce again', () => {
  const shown = copyFeedbackReducer(
    { status: 'idle' },
    {
      type: 'copy-settled',
      ok: true,
    }
  );
  const cleared = copyFeedbackReducer(shown, { type: 'reset' });
  assert.equal(cleared.status, 'idle');

  const again = copyFeedbackReducer(cleared, {
    type: 'copy-settled',
    ok: true,
  });
  assert.equal(again.status, 'copied');
});

test('copying again while feedback is visible replaces it', () => {
  const failed = copyFeedbackReducer(
    { status: 'failed' },
    {
      type: 'copy-settled',
      ok: true,
    }
  );
  assert.equal(failed.status, 'copied');
});

test('the reset action leaves an idle state idle', () => {
  const state = copyFeedbackReducer({ status: 'idle' }, { type: 'reset' });
  assert.equal(state.status, 'idle');
});

test('feedback stays visible long enough to be read', () => {
  assert.ok(COPY_FEEDBACK_MS >= 1000);
});
