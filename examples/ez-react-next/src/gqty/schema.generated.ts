/**
 * GQTY AUTO-GENERATED CODE: PLEASE DO NOT MODIFY MANUALLY
 */

export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export interface Scalars {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
}

export const scalarsEnumsHash: import('gqty').ScalarsEnumsHash = {
  String: true,
  Boolean: true,
};
export const generatedSchema = {
  query: { __typename: { __type: 'String!' }, hello: { __type: 'String!' } },
  mutation: {},
  subscription: {},
} as const;

export interface Query {
  __typename?: 'Query';
  hello: ScalarsEnums['String'];
}

export interface Mutation {
  __typename?: 'Mutation';
}

export interface Subscription {
  __typename?: 'Subscription';
}

export interface SchemaObjectTypes {
  Query: Query;
  Mutation: Mutation;
  Subscription: Subscription;
}
export type SchemaObjectTypesNames = 'Query' | 'Mutation' | 'Subscription';

export interface GeneratedSchema {
  query: Query;
  mutation: Mutation;
  subscription: Subscription;
}

export type MakeNullable<T> = {
  [K in keyof T]: T[K] | undefined;
};

export interface ScalarsEnums extends MakeNullable<Scalars> {}
