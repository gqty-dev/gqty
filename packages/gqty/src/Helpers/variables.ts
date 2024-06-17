export type Variables<T> = T extends (args: infer V) => unknown ? V : never;
