import * as fastify from 'fastify';

export { default as waitForExpect } from 'wait-for-expect';
export * from './app';
export * from './client';
export { fastify };

export function assertIsDefined<T = unknown>(
  value: T,
  message?: string
): asserts value is NonNullable<T> {
  if (value == null) {
    const error = new Error(message || 'value is nullable');

    Error.captureStackTrace(error, assertIsDefined);
    throw error;
  }
}
