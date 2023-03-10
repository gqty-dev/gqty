/**
 * GQTY AUTO-GENERATED CODE: PLEASE DO NOT MODIFY MANUALLY
 */

export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
/** All built-in and custom scalars, mapped to their actual values */
export interface Scalars {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
}

export const scalarsEnumsHash: import('gqty').ScalarsEnumsHash = {
  Boolean: true,
  ID: true,
  String: true,
};
export const generatedSchema = {
  User: {
    __typename: { __type: 'String!' },
    id: { __type: 'ID!' },
    users: { __type: '[User!]!' },
  },
  mutation: {},
  query: {
    __typename: { __type: 'String!' },
    hello: { __type: 'String!' },
    user: { __type: 'User!' },
  },
  subscription: {},
} as const;

export interface User {
  __typename?: 'User';
  id: ScalarsEnums['ID'];
  users: Array<User>;
}

export interface Mutation {
  __typename?: 'Mutation';
}

export interface Query {
  __typename?: 'Query';
  hello: ScalarsEnums['String'];
  user: User;
}

export interface Subscription {
  __typename?: 'Subscription';
}

export interface GeneratedSchema {
  query: Query;
  mutation: Mutation;
  subscription: Subscription;
}

export type MakeNullable<T> = {
  [K in keyof T]: T[K] | undefined;
};

export interface ScalarsEnums extends MakeNullable<Scalars> {}
