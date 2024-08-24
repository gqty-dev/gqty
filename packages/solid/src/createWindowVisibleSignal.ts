import { createSignal, onCleanup, onMount } from 'solid-js';

export const createWindowVisibleSignal = () => {
  const { document } = globalThis;
  const [visible, setVisible] = createSignal(!document.hidden);
  const listener = () => {
    setVisible(!document.hidden);
  };

  onMount(() => {
    document.addEventListener('visibilitychange', listener);
  });

  onCleanup(() => {
    document.removeEventListener('visibilitychange', listener);
  });

  return visible;
};
