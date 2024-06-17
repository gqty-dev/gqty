export * from './hash';
export * from './object';
export * from './pick';

export const isInteger = (v: unknown): v is number => Number.isInteger(v);
