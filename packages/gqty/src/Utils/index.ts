export const isInteger = (v: any): v is number => Number.isInteger(v);

export function isEmptyObject(obj: object) {
  for (var _i in obj) return false;
  return true;
}

export * from './object';
export * from './promise';
