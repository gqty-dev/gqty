/**
 * Index math for the `Tabs` tab list's keyboard interaction.
 *
 * Kept free of React so the wrapping and clamping rules can be tested directly;
 * `Tabs` only maps the returned index onto focus and selection.
 */

/**
 * Decides which tab a key press should activate.
 *
 * @param {string} key
 * @param {number} activeIndex
 * @param {number} count
 * @returns {number} the index to activate, or `activeIndex` when the key is
 *   not part of the tablist interaction model
 */
export function nextTabIndex(key, activeIndex, count) {
  if (count <= 0) return activeIndex;

  switch (key) {
    case 'ArrowRight':
      return (activeIndex + 1) % count;
    case 'ArrowLeft':
      return (activeIndex - 1 + count) % count;
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    default:
      return activeIndex;
  }
}
