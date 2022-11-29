export function debounce<T extends unknown[]>(
  fn: (...args: T) => void,
  delay: number
) {
  let timeout: NodeJS.Timeout | string | number | undefined = undefined;

  return function debounced(...args: Parameters<typeof fn>) {
    const execFetch = () => {
      timeout = undefined;
      fn(...args);
    };
    if (timeout !== undefined) clearTimeout(timeout);

    if (delay < 0) {
      execFetch();
      timeout = undefined;
    } else {
      timeout = setTimeout(execFetch, delay);
    }
  };
}
