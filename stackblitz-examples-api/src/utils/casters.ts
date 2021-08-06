export function toInteger(n: string | number): number {
  let prevN = n;
  if (typeof n === 'string') {
    try {
      n = parseInt(n);
    } catch (err) {}
  }

  if (typeof n === 'number' && Number.isSafeInteger(n)) return n;

  const err = Error(`Unexpected non-integer value: '${prevN}'`);

  Error.captureStackTrace(err, toInteger);

  throw err;
}
