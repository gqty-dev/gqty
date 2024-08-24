import type { BaseGeneratedSchema, Client } from 'gqty';
import type { CommonOptions, DefaultOptions, SolidClientOptions } from '.';

export type MutateFunction<
  TSchema extends BaseGeneratedSchema,
  TArgs extends unknown[],
  TResult,
> = (mutation: NonNullable<TSchema['mutation']>, ...args: TArgs) => TResult;

export type CreateMutation<TSchema extends BaseGeneratedSchema> = <
  TArgs extends unknown[],
  TResult,
>(
  fn: MutateFunction<TSchema, TArgs, TResult>
) => (...args: TArgs) => Promise<TResult>;

export type CreateMutationOptions = CommonOptions & DefaultOptions;

export const createMutation =
  <TSchema extends BaseGeneratedSchema>(
    client: Client<TSchema>,
    clientOptions?: SolidClientOptions
  ): CreateMutation<TSchema> =>
  <TArgs extends unknown[], TResult>(
    mutate: MutateFunction<TSchema, TArgs, TResult>,
    options?: CreateMutationOptions
  ) =>
  (...args: TArgs): Promise<TResult> => {
    return client.resolve(({ mutation }) => mutate(mutation!, ...args), {
      ...clientOptions?.defaults,
      ...options,
    });
  };
