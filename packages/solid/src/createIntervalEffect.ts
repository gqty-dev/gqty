import { onCleanup, onMount } from 'solid-js';

type ArrowFunction<TArgs extends unknown[], TResult> = (
  ...args: TArgs
) => TResult;

export const createIntervalEffect = <
  TCallback extends ArrowFunction<unknown[], unknown>,
>(
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
