import * as fastify from 'fastify';
import * as randomstring from 'randomstring';

export { default as waitForExpect } from 'wait-for-expect';
export * from './app';
export { fastify, randomstring };

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
