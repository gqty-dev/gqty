export type Variables<T> = T extends (args: infer V) => any ? V : never;
