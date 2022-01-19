/**
 * GQTY AUTO-GENERATED CODE: PLEASE DO NOT MODIFY MANUALLY
 */

import { SchemaUnionsKey } from 'gqty';

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
  String: true,
};
export const generatedSchema = {
  A: { __typename: { __type: 'String!' }, foo: { __type: 'Foo' } },
  B: { __typename: { __type: 'String!' }, foo: { __type: 'Foo' } },
  C: { __typename: { __type: 'String!' }, foo: { __type: 'Foo' } },
  Foo: { __typename: { __type: 'String!' }, bar: { __type: 'String' } },
  Module: { __typename: { __type: 'String!' }, $on: { __type: '$Module!' } },
  Page: {
    __typename: { __type: 'String!' },
    pageBuilder: { __type: 'PageBuilder!' },
  },
  PageBuilder: {
    __typename: { __type: 'String!' },
    modules: { __type: '[Module!]!' },
  },
  mutation: {},
  query: {
    __typename: { __type: 'String!' },
    page: { __type: 'Page!', __args: { a: 'String' } },
  },
  subscription: {},
  [SchemaUnionsKey]: { Module: ['A', 'B', 'C'] },
} as const;

export interface A {
  __typename?: 'A';
  foo?: Maybe<Foo>;
}

export interface B {
  __typename?: 'B';
  foo?: Maybe<Foo>;
}

export interface C {
  __typename?: 'C';
  foo?: Maybe<Foo>;
}

export interface Foo {
  __typename?: 'Foo';
  bar?: Maybe<ScalarsEnums['String']>;
}

export interface Module {
  __typename?: 'A' | 'B' | 'C';
  $on: $Module;
}

export interface Page {
  __typename?: 'Page';
  pageBuilder: PageBuilder;
}

export interface PageBuilder {
  __typename?: 'PageBuilder';
  modules: Array<Module>;
}

export interface Mutation {
  __typename?: 'Mutation';
}

export interface Query {
  __typename?: 'Query';
  page: (args?: { a?: Maybe<Scalars['String']> }) => Page;
}

export interface Subscription {
  __typename?: 'Subscription';
}

export interface SchemaObjectTypes {
  A: A;
  B: B;
  C: C;
  Foo: Foo;
  Mutation: Mutation;
  Page: Page;
  PageBuilder: PageBuilder;
  Query: Query;
  Subscription: Subscription;
}
export type SchemaObjectTypesNames =
  | 'A'
  | 'B'
  | 'C'
  | 'Foo'
  | 'Mutation'
  | 'Page'
  | 'PageBuilder'
  | 'Query'
  | 'Subscription';

export interface $Module {
  A?: A;
  B?: B;
  C?: C;
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
