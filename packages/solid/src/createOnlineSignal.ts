import { createSignal, onCleanup, onMount } from 'solid-js';

export const createOnlineSignal = () => {
  const { navigator } = globalThis;
  const [online, setOnline] = createSignal(navigator.onLine);
  const listener = () => {
    setOnline(navigator.onLine);
  };

  onMount(() => {
    globalThis.addEventListener('online', listener);
    globalThis.addEventListener('offline', listener);
  });

  onCleanup(() => {
    globalThis.removeEventListener('online', listener);
    globalThis.removeEventListener('offline', listener);
  });

  return online;
};
