import { onCleanup, onMount } from 'solid-js';
import type { ArrowFunction } from '.';

export const createIntervalEffect = <TCallback extends ArrowFunction>(
  fn: TCallback,
  interval: number,
  getArguments?: () => Parameters<TCallback>
) => {
  let intervalId: number | NodeJS.Timeout;

  onMount(() => {
    if (intervalId) return;

    intervalId = setInterval(() => {
      const args = getArguments?.() ?? [];
      fn(...args);
    }, interval);
  });

  onCleanup(() => {
    clearInterval(intervalId);
  });
};
