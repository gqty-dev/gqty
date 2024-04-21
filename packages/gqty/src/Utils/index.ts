export * from './hash';
export * from './object';
export * from './pick';

export const isInteger = (v: any): v is number => Number.isInteger(v);
