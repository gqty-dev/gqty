import assert from 'assert';

export const ensureVariables = <TKey extends string>(...keys: TKey[]): { [key in TKey]: string } => {
  const missingKeys = keys.sort().filter((key) => !process.env[key]?.trim());

  assert(
    missingKeys.length === 0,
    `Invalid application environment, required variable(s): ${keys
      .map((key) => (missingKeys.includes(key) ? `${key}?` : key))
      .join(', ')}`,
  );

  return process.env as { [key in TKey]: string };
};
