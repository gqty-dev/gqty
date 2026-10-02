/**
 * State machine for the hero copy button's clipboard feedback.
 *
 * Kept free of React so the "only report success when the write resolved, and
 * reset so a repeat copy announces again" rules can be tested directly.
 */

/** How long feedback stays on screen before it is cleared. */
export const COPY_FEEDBACK_MS = 2000;

/**
 * @typedef {{ status: 'idle' | 'copied' | 'failed' }} CopyFeedbackState
 * @typedef {{ type: 'copy-settled', ok: boolean } | { type: 'reset' }} CopyFeedbackAction
 */

/**
 * @param {CopyFeedbackState} state
 * @param {CopyFeedbackAction} action
 * @returns {CopyFeedbackState}
 */
export function copyFeedbackReducer(state, action) {
  switch (action.type) {
    case 'copy-settled':
      return { status: action.ok ? 'copied' : 'failed' };
    case 'reset':
      return { status: 'idle' };
    default:
      return state;
  }
}
