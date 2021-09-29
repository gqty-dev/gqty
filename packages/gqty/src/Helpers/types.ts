export type Variables<Field extends (...args: [any]) => any = never> =
  Parameters<Field>[0];

export type Args<Field extends (...args: [any]) => any = never> =
  Variables<Field>;
